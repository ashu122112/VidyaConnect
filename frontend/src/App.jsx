// Polyfill for Vite to handle 'global' not being defined

import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Peer from 'simple-peer';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:8080';

// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUser({ email: decoded.sub, role: decoded.role });
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            setUser({ email: decoded.sub, role: decoded.role });
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

    const authValue = { user, login, logout, register };

    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};


// --- Pages & Components ---

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800">Login to VidyaConnect</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Login</button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const { register } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        register(email, password, role);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800">Create an Account</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Register</button>
                </form>
                 <p className="text-sm text-center text-gray-600">
                    Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [sessionTitle, setSessionTitle] = useState('');
    const navigate = useNavigate();

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/sessions/active`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        }
    };
    
    useEffect(() => {
        fetchSessions();
    }, []);

    const handleCreateSession = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/sessions/create`, 
                { title: sessionTitle },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate(`/session/${response.data.id}`);
        } catch (error) {
            console.error('Failed to create session', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="flex items-center justify-between p-4 bg-white shadow-md">
                <h1 className="text-2xl font-bold text-blue-600">VidyaConnect Dashboard</h1>
                <div>
                    <span className="mr-4 text-gray-700">Welcome, {user.email} ({user.role})</span>
                    <button onClick={logout} className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600">Logout</button>
                </div>
            </header>
            <main className="p-8">
                {user.role === 'TEACHER' && (
                    <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">Create a New Session</h2>
                        <form onSubmit={handleCreateSession} className="flex space-x-4">
                            <input
                                type="text"
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                                placeholder="Enter session title"
                                required
                                className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="px-6 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600">Start Session</button>
                        </form>
                    </div>
                )}
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Active Sessions</h2>
                    {sessions.length > 0 ? (
                        <ul className="space-y-3">
                            {sessions.map(session => (
                                <li key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                                    <div>
                                        <p className="font-semibold">{session.title}</p>
                                        <p className="text-sm text-gray-600">Teacher: {session.teacherName}</p>
                                    </div>
                                    <Link to={`/session/${session.id}`} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                        Join
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No active sessions right now.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

const SessionPage = () => {
    const { sessionId } = useParams();
    const { user } = useAuth();
    const myVideo = useRef();
    const peersRef = useRef({});
    const [peers, setPeers] = useState([]);
    const stompClient = useRef(null);
    const localStreamRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }
            localStreamRef.current = stream;

            const client = new Client({
                webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
                connectHeaders: { Authorization: `Bearer ${token}` },
                reconnectDelay: 5000,
                onConnect: () => {
                    console.log('Connected to WebSocket');

                    client.subscribe(`/topic/signal/${sessionId}`, message => {
                        const signalPayload = JSON.parse(message.body);
                        const { sender, data } = signalPayload;
                        
                        if (sender === user.email) return;

                        let peer = peersRef.current[sender];

                        if (data.type === 'offer') {
                             console.log(`Receiving offer from new peer: ${sender}`);
                             peer = createPeer(sender, false, stream);
                             peer.signal(data);
                             peersRef.current[sender] = peer;
                             setPeers(prev => [...prev.filter(p => p.peerID !== sender), { peerID: sender, peer }]);
                        } else if (data.type === 'answer') {
                            if (peer) {
                                console.log(`Receiving answer from: ${sender}`);
                                peer.signal(data);
                            }
                        } else if (data.candidate) {
                             if (peer) {
                                peer.signal(data);
                            }
                        } else if (data.type === 'join' && user.role === 'TEACHER') {
                             console.log(`New user joined: ${sender}. Creating peer.`);
                             const newPeer = createPeer(sender, true, stream);
                             peersRef.current[sender] = newPeer;
                             setPeers(prev => [...prev.filter(p => p.peerID !== sender), { peerID: sender, peer: newPeer }]);
                        }
                    });

                    // Announce presence
                     client.publish({
                        destination: `/app/signal/${sessionId}`,
                        body: JSON.stringify({ sender: user.email, data: { type: 'join' } }),
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
            });

            client.activate();
            stompClient.current = client;
        }).catch(err => {
            console.error("Error accessing media devices.", err);
            alert("Could not access camera and microphone. Please check permissions and try again.");
        });

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
            Object.values(peersRef.current).forEach(peer => peer.destroy());
            if(localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [sessionId, user.email, user.role]);

    function createPeer(peerID, initiator, stream) {
        const peer = new Peer({
            initiator,
            trickle: true,
            stream,
        });

        peer.on("signal", signal => {
             if (stompClient.current && stompClient.current.connected) {
                stompClient.current.publish({
                    destination: `/app/signal/${sessionId}`,
                    body: JSON.stringify({ sender: user.email, receiver: peerID, data: signal }),
                });
            }
        });
        
        peer.on('close', () => {
            console.log(`${peerID} connection closed.`);
            setPeers(prev => prev.filter(p => p.peerID !== peerID));
            delete peersRef.current[peerID];
        });
        
        peer.on('error', (err) => {
            console.error(`Error with peer ${peerID}:`, err);
        });

        return peer;
    }

    const Video = ({ peer }) => {
        const ref = useRef();
        useEffect(() => {
            peer.on('stream', stream => {
                if (ref.current) {
                   ref.current.srcObject = stream;
                }
            });
        }, [peer]);
        return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />;
    };


    return (
        <div className="flex flex-col h-screen p-4 bg-gray-900 text-white">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Session: {sessionId}</h1>
                <Link to="/dashboard" className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600">Leave Session</Link>
            </header>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="relative bg-black rounded-lg overflow-hidden">
                    <video muted ref={myVideo} autoPlay playsInline className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded">You ({user.email})</span>
                </div>
                {peers.map(({ peerID, peer }) => (
                     <div key={peerID} className="relative bg-black rounded-lg overflow-hidden">
                        <Video peer={peer} />
                        <span className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded">{peerID}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main App Component ---
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

