"use client";
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // هيشيل بيانات الـ login والـ branches
    const [currentBranchId, setCurrentBranchId] = useState(null); // الفرع اللي اليوزر اختاره بعد اللوجن

    const login = (userData) => {
        setUser(userData);
    };

    const selectBranch = (branchId) => {
        setCurrentBranchId(branchId);
    };

    const logout = () => {
        setUser(null);
        setCurrentBranchId(null);
    };

    return (
        <AuthContext.Provider value={{ user, currentBranchId, login, selectBranch, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
