// src/context/AuthContext.js
// Authentication context provider

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../utils/api';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    loggedIn: false,
    user: null,
    token: null,
    sessionExpiry: null
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Session duration - 1 hour
  const SESSION_DURATION = 60 * 60 * 1000; // 1 hour
  
  // Function to check if session is expired
  const isSessionExpired = (expiryTime) => {
    if (!expiryTime) return true;
    return new Date().getTime() > expiryTime;
  };

  // Function to set session data
  const setSession = (token, user) => {
    if (!token || !user) {
      console.error('Invalid session data: Token or user is missing');
      return;
    }
    
    const expiryTime = new Date().getTime() + SESSION_DURATION;
    const sessionData = {
      token,
      user,
      expiryTime,
      lastActivity: new Date().getTime()
    };
    
    try {
      localStorage.setItem('sessionData', JSON.stringify(sessionData));
      setAuth({
        loggedIn: true,
        user,
        token,
        sessionExpiry: expiryTime
      });
    } catch (error) {
      console.error('Error setting session:', error);
    }
  };

  // Function to clear session
  const clearSession = (message) => {
    try {
      localStorage.removeItem('sessionData');
      
      // Set auth state to logged out
      setAuth({
        loggedIn: false,
        user: null,
        token: null,
        sessionExpiry: null
      });
      
      // Only redirect if:
      // 1. We have a message to show
      // 2. We're not already on the login page
      // 3. We're not in the middle of a navigation
      if (
        message && 
        !location.pathname.includes('/login') &&
        !location.pathname.includes('/signup')
      ) {
        navigate('/login', { 
          state: { message }, 
          replace: true 
        });
      }
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  // Function to update last activity
  const updateLastActivity = useCallback(() => {
    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'));
      if (sessionData) {
        sessionData.lastActivity = new Date().getTime();
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }, []);

  // Check session status on mount and when location changes
  useEffect(() => {
    let mounted = true;
    let sessionCheckInterval;

    const checkSession = async () => {
      if (!mounted) return;
      
      try {
        const response = await apiService.auth.checkAuth();
        if (!response.data.valid) {
          clearSession('Session expired. Please login again.');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        clearSession('Session verification failed. Please login again.');
      }
    };
    
    // Set up periodic session checks - every 5 minutes is sufficient
    sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [navigate, location.pathname, clearSession]);

  // Set up activity listener
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      // Only update if the user is logged in
      if (auth.loggedIn) {
        updateLastActivity();
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateLastActivity, auth.loggedIn]);

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ 
      auth, 
      setAuth: (newAuth) => {
        if (newAuth.loggedIn && newAuth.token && newAuth.user) {
          setSession(newAuth.token, newAuth.user);
        } else {
          clearSession();
        }
      },
      clearSession,
      loading,
      updateLastActivity
    }}>
      {children}
    </AuthContext.Provider>
  );
};
