import React, { useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../services/apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const decodeAndSetUser = (token) => {
        try {
            const decoded = jwtDecode(token);
            let role = '';
            // Robustly parse the role from the JWT token's 'authorities' claim
            if (decoded.authorities && Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
                const authority = decoded.authorities[0];
                if (typeof authority === 'object' && authority.authority) {
                    role = authority.authority.replace('ROLE_', '');
                } else if (typeof authority === 'string') {
                    role = authority.replace('ROLE_', '');
                }
            }
            
            if (decoded.exp * 1000 > Date.now()) {
                setUser({ email: decoded.sub, role });
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            decodeAndSetUser(token);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            decodeAndSetUser(token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    const register = async (email, password, role) => {
        try {
            await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password, role });
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('Registration failed', error);
            alert('Registration failed. The email might already be in use.');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const value = { user, login, logout, register };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

