"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { User, UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (
        name: string,
        email: string,
        password: string,
        role: UserRole
    ) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Transform Supabase user to our app's User type
async function transformUser(supabaseUser: SupabaseUser): Promise<User | null> {
    const supabase = createClient();

    // Fetch the profile from our profiles table
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle();

    if (error || !profile) {
        console.error("Error fetching profile:", error);
        // Return basic user info if profile not found
        return {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
            role: (supabaseUser.user_metadata?.role as UserRole) || "tenant",
            createdAt: new Date(supabaseUser.created_at),
        };
    }

    return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        phone: profile.phone || undefined,
        avatar: profile.avatar || undefined,
        createdAt: new Date(profile.created_at),
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Load user session on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const {
                    data: { user: supabaseUser },
                } = await supabase.auth.getUser();

                if (supabaseUser) {
                    const appUser = await transformUser(supabaseUser);
                    setUser(appUser);
                }
            } catch (error) {
                console.error("Error loading user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session?.user) {
                const appUser = await transformUser(session.user);
                setUser(appUser);
            } else if (event === "SIGNED_OUT") {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const login = useCallback(
        async (
            email: string,
            password: string
        ): Promise<{ success: boolean; error?: string }> => {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    return { success: false, error: error.message };
                }

                if (data.user) {
                    const appUser = await transformUser(data.user);
                    setUser(appUser);
                    return { success: true };
                }

                return { success: false, error: "Login failed" };
            } catch (error) {
                console.error("Login error:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                };
            }
        },
        [supabase.auth]
    );

    const register = useCallback(
        async (
            name: string,
            email: string,
            password: string,
            role: UserRole
        ): Promise<{ success: boolean; error?: string }> => {
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            role,
                        },
                    },
                });

                if (error) {
                    return { success: false, error: error.message };
                }

                if (data.user) {
                    // Create profile manually (in case trigger doesn't work due to permissions)
                    const { error: profileError } = await supabase
                        .from("profiles")
                        .upsert({
                            id: data.user.id,
                            email: data.user.email || email,
                            name,
                            role,
                        }, { onConflict: 'id' });

                    if (profileError) {
                        console.error("Profile creation error:", profileError);
                        // Don't fail registration if profile already exists
                        if (!profileError.message.includes('duplicate')) {
                            // Profile creation failed, but user was created - continue anyway
                            console.warn("Profile creation failed, will retry on next login");
                        }
                    }

                    const appUser = await transformUser(data.user);
                    setUser(appUser);
                    return { success: true };
                }

                return { success: false, error: "Registration failed" };
            } catch (error) {
                console.error("Registration error:", error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                };
            }
        },
        [supabase, supabase.auth]
    );

    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            // Force a page reload to clear all state and navigate to home
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
            // Even if there's an error, clear local state
            setUser(null);
            window.location.href = "/";
        }
    }, [supabase.auth]);

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
