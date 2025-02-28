// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ loggedIn: false, user: null });

    // Load the auth state from localStorage when the app starts
    useEffect(() => {
        const storedAuth = localStorage.getItem('auth');
        if (storedAuth) {
            try {
                const parsedAuth = JSON.parse(storedAuth);
                if (parsedAuth && parsedAuth.loggedIn) {
                    setAuth(parsedAuth);
                }
            } catch (error) {
                console.error("Error parsing stored auth data", error);
            }
        }
    }, []);

    // Save the auth state to localStorage whenever it changes
    useEffect(() => {
        if (auth.loggedIn) {
            localStorage.setItem('auth', JSON.stringify(auth));
        } else {
            localStorage.removeItem('auth');
        }
    }, [auth]);

    const setUser = (user) => {
        if (user) {
            const newAuth = { loggedIn: true, user };
            setAuth(newAuth);
            localStorage.setItem('auth', JSON.stringify(newAuth)); // Save updated auth in local storage
        }
    };

    const clearUser = () => {
        setAuth({ loggedIn: false, user: null });
        localStorage.removeItem('auth');
    };

    return (
        <AuthContext.Provider value={{ auth, setUser, clearUser }}>
            {children}
        </AuthContext.Provider>
    );
};
