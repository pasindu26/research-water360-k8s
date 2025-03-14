// src/components/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/main.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionMessage, setSessionMessage] = useState('');
    
    const { login } = useAuth();
    const location = useLocation();

    useEffect(() => {
        // Check for session expiry message
        if (location.state?.message) {
            setSessionMessage(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear any previous messages
        setError('');
        setSessionMessage('');
        
        // Validate form
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }
        
        setLoading(true);
        
        try {
            const result = await login({ username, password });
            
            if (!result.success) {
                setError(result.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred during login. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-center mt-5">
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h2 className="text-center mb-4">Login</h2>
                            
                            {sessionMessage && (
                                <Alert variant="warning" onClose={() => setSessionMessage('')} dismissible>
                                    {sessionMessage}
                                </Alert>
                            )}
                            
                            {error && (
                                <Alert variant="danger" onClose={() => setError('')} dismissible>
                                    {error}
                                </Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        disabled={loading}
                                    >
                                        {loading ? 'Logging in...' : 'Login'}
                                    </Button>
                                </div>
                            </Form>
                            
                            <div className="text-center mt-3">
                                <p>
                                    Don't have an account? <Link to="/signup">Sign up</Link>
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage; 
