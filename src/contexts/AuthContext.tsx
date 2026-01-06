"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { mockUsers } from "@/data/mock";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "rentease_user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Convert date strings back to Date objects
                parsedUser.createdAt = new Date(parsedUser.createdAt);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse stored user:", error);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [user]);

    const login = async (email: string, _password: string): Promise<boolean> => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // For MVP, accept any password and check if email exists in mock data
        const foundUser = mockUsers.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (foundUser) {
            setUser(foundUser);
            return true;
        }

        // If not in mock data, create a demo tenant user
        if (email && email.includes("@")) {
            const newUser: User = {
                id: `user-${Date.now()}`,
                email,
                name: email.split("@")[0],
                role: "tenant",
                createdAt: new Date(),
            };
            setUser(newUser);
            return true;
        }

        return false;
    };

    const register = async (
        name: string,
        email: string,
        _password: string,
        role: UserRole
    ): Promise<boolean> => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if email already exists
        const existingUser = mockUsers.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return false; // Email already exists
        }

        // Create new user
        const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name,
            role,
            createdAt: new Date(),
        };

        setUser(newUser);
        return true;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
