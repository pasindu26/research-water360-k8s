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
      try {
        // Get session data from localStorage
        const sessionDataStr = localStorage.getItem('sessionData');
        
        // If no session data exists, we're done
        if (!sessionDataStr) {
          if (mounted) setLoading(false);
          return;
        }

        // Try to parse the session data
        let sessionData;
        try {
          sessionData = JSON.parse(sessionDataStr);
        } catch (error) {
          console.error('Error parsing session data:', error);
          clearSession();
          if (mounted) setLoading(false);
          return;
        }

        // Check if session is expired
        if (isSessionExpired(sessionData.expiryTime)) {
          clearSession('Your session has expired. Please login again.');
          if (mounted) setLoading(false);
          return;
        }

        // Check for inactivity timeout (30 minutes)
        const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
        if (new Date().getTime() - sessionData.lastActivity > inactivityTimeout) {
          clearSession('Session expired due to inactivity. Please login again.');
          if (mounted) setLoading(false);
          return;
        }

        // Always set auth state from stored session data first
        if (mounted) {
          setAuth({
            loggedIn: true,
            user: sessionData.user,
            token: sessionData.token,
            sessionExpiry: sessionData.expiryTime
          });
          
          // We can consider the loading done at this point
          setLoading(false);
        }

        // Now try to verify the token with the backend, but don't block on it
        try {
          const response = await apiService.auth.checkAuth();
          
          if (mounted && response.data && response.data.user) {
            setAuth(prev => ({
              ...prev,
              user: response.data.user // Update with latest user data
            }));
          }
        } catch (error) {
          console.warn('Auth check failed:', error);
          // Don't clear session on backend errors - rely on the client-side expiry
          // This prevents CORS issues from logging users out
          
          // Only clear session if we get a specific 401 from the server
          if (error.response && error.response.status === 401) {
            clearSession('Session invalid. Please login again.');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        // Don't clear session for general errors
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();
    
    // Set up periodic session checks - every 5 minutes is sufficient
    sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(sessionCheckInterval);
    };
  }, [navigate, location.pathname]);

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
