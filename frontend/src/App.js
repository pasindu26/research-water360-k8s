// src/App.js
import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AppNavbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ThemeContext } from './context/ThemeContext';

// Import pages
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import GraphPage from './components/GraphPage';
import DataTable from './components/DataTable';
import CompareGraphPage from './components/CompareGraphPage';
import AdminPage from './components/AdminPage';
import Pricing from './pages/Pricing';
import FAQs from './pages/FAQs';
import About from './pages/About';

// Import styles
import './styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const { auth } = useContext(AuthContext);
    const location = useLocation();
    const [authLoading, setAuthLoading] = useState(true);
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        // Simulating a short delay to ensure auth state is loaded
        const timeout = setTimeout(() => {
            setAuthLoading(false);
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    if (authLoading) {
        return (
            <div className="spinner-container" style={{ height: '100vh', background: 'var(--bg-gradient)' }}>
                <div className="text-center text-white">
                    <div className="spinner"></div>
                    <h2 className="mt-3">Loading...</h2>
                    <p>Please wait while we prepare your experience!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`app ${theme}`}>
            {/* Navbar */}
            <AppNavbar />

            {/* Main Content */}
            <div className="main-content container mt-4">
                <Routes>
                    {/* Auth Routes */}
                    <Route
                        path="/login"
                        element={
                            auth.loggedIn ? (
                                <Navigate to={auth.user?.user_type === 'admin' ? '/admin' : '/'} replace />
                            ) : (
                                <LoginPage />
                            )
                        }
                    />
                    <Route
                        path="/signup"
                        element={auth.loggedIn ? <Navigate to="/" replace /> : <SignupPage />}
                    />
                    
                    {/* Protected Routes */}
                    <Route
                        path="/admin"
                        element={
                            auth.loggedIn && auth.user?.user_type === 'admin' ? (
                                <AdminPage />
                            ) : (
                                <Navigate to="/login" state={{ from: location }} replace />
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={
                            auth.loggedIn ? (
                                <HomePage />
                            ) : (
                                <Navigate to="/login" state={{ from: location }} replace />
                            )
                        }
                    />
                    <Route
                        path="/graphs"
                        element={
                            auth.loggedIn ? (
                                <GraphPage />
                            ) : (
                                <Navigate to="/login" state={{ from: location }} replace />
                            )
                        }
                    />
                    <Route
                        path="/compare-graphs"
                        element={
                            auth.loggedIn ? (
                                <CompareGraphPage />
                            ) : (
                                <Navigate to="/login" state={{ from: location }} replace />
                            )
                        }
                    />
                    <Route
                        path="/DataTable"
                        element={
                            auth.loggedIn ? (
                                <DataTable />
                            ) : (
                                <Navigate to="/login" state={{ from: location }} replace />
                            )
                        }
                    />
                    
                    {/* Public Routes */}
                    <Route
                        path="/pricing"
                        element={
                            auth.loggedIn ? (
                                <Navigate to="/" replace />
                            ) : (
                                <Pricing />
                            )
                        }
                    />
                    <Route
                        path="/faqs"
                        element={
                            auth.loggedIn ? (
                                <Navigate to="/" replace />
                            ) : (
                                <FAQs />
                            )
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            auth.loggedIn ? (
                                <Navigate to="/" replace />
                            ) : (
                                <About />
                            )
                        }
                    />
                    
                    {/* Fallback Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default App;
