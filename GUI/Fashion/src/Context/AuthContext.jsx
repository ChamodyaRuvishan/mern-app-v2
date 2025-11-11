import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

const AuthContextProvider = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth-token');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('auth-token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        setIsAuthenticated(false);
    };

    const contextValue = {
        isAuthenticated,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;