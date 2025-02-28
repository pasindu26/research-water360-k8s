// src/App.js
import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer'; // Import the Footer component
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import SignupPage from './components/SignupPage';
import GraphPage from './components/GraphPage';
import DataTable from './components/DataTable';
import CompareGraphPage from './components/CompareGraphPage';
import AdminPage from './components/AdminPage';
import Pricing from './pages/Pricing'; // Import additional pages
import FAQs from './pages/FAQs';
import About from './pages/About';

function App() {
    const { auth } = useContext(AuthContext);
    const location = useLocation();
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        // Simulating a short delay to ensure auth state is loaded
        const timeout = setTimeout(() => {
            setAuthLoading(false);
        }, 500);
        return () => clearTimeout(timeout);
    }, []);

    if (authLoading) {
        // Show an interactive and visually appealing loading state
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: 'linear-gradient(135deg, #6a11cb 0%, #59a5c1 100%)',
                    color: '#fff',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <div>
                    <div
                        className="spinner-border text-light"
                        style={{ width: '3rem', height: '3rem', marginBottom: '1rem' }}
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Loading...</h2>
                    <p style={{ fontSize: '1.2rem' }}>Please wait while we prepare your experience!</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <AppNavbar />

            {/* Main Content */}
            <div className="container mt-4" style={{ flex: 1 }}>
                <Routes>
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
                        element={auth.loggedIn ? <GraphPage /> : <Navigate to="/login" state={{ from: location }} replace />}
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
                        element={auth.loggedIn ? <DataTable /> : <Navigate to="/login" state={{ from: location }} replace />}
                    />
                    {/* Additional Pages */}
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default App;
