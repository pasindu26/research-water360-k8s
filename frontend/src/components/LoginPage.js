// src/components/LoginPage.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
    const { setUser } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    //console.log("window._env_:", window._env_);  // Debugging step
    //const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const BACKEND_URL = window._env_?.REACT_APP_BACKEND_URL;
    //console.log("BACKEND_URL:", BACKEND_URL);  // Debugging step

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${BACKEND_URL}/login`,
                { username, password },
                { withCredentials: true }
            );

            const user = response.data.user;
            setUser(user);
            localStorage.setItem('authToken', response.data.token);
            setErrorMessage('');

            if (user.user_type === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Login failed.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleLogin}>
                <Form.Group controlId="username">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter username"
                    />
                </Form.Group>
                <Form.Group controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter password"
                    />
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3">
                    Login
                </Button>
            </Form>
            <p className="mt-3">
                Don't have an account? <a href="/signup">Sign up here</a>.
            </p>
        </div>
    );
}

export default LoginPage; 
