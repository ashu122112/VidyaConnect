import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import all the pages from the 'pages' directory
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SessionPage from './pages/SessionPage';

function App() {
    return (
        // The AuthProvider wraps the entire application, making user data available everywhere
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes - a user must be logged in to access these */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/session/:sessionId" 
                    element={
                        <ProtectedRoute>
                            <SessionPage />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </AuthProvider>
    );
}

export default App;

