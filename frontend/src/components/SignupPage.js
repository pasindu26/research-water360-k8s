// src/components/SignupPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

function SignupPage() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        username: '',
        password: '',
        email: '',
        user_type: 'customer' // Default user type
    });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const BACKEND_URL = window._env_?.REACT_APP_BACKEND_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${BACKEND_URL}/signup`, formData);
            setErrorMessage('');
            navigate('/login');
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Signup failed.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Signup</h2>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleSignup}>
                <Form.Group controlId="firstname">
                    <Form.Label>First Name:</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        required
                        placeholder="Enter first name"
                    />
                </Form.Group>
                <Form.Group controlId="lastname">
                    <Form.Label>Last Name:</Form.Label>
                    <Form.Control
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                        placeholder="Enter last name"
                    />
                </Form.Group>
                <Form.Group controlId="username">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Enter username"
                    />
                </Form.Group>
                <Form.Group controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter password"
                    />
                </Form.Group>
                <Form.Group controlId="email">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter email"
                    />
                </Form.Group>
                <Form.Group controlId="user_type">
                    <Form.Label>User Type:</Form.Label>
                    <Form.Control
                        as="select"
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                    </Form.Control>
                </Form.Group>
                <Button type="submit" variant="primary" className="mt-3">
                    Signup
                </Button>
            </Form>
            <p className="mt-3">
                Already have an account? <a href="/login">Login here</a>.
            </p>
        </div>
    );
}

export default SignupPage;
