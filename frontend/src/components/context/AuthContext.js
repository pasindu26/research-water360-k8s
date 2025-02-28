import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ loggedIn: false, user: null });

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get(`${window._env_?.REACT_APP_BACKEND_URL}/user`, { withCredentials: true });
        setAuth({ loggedIn: true, user: response.data });
      } catch {
        setAuth({ loggedIn: false, user: null });
      }
    };
    checkLogin();
  }, []);

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};
