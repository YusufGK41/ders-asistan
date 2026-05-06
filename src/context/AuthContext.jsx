import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mevcut session'ı kontrol et
        const getSession = async () => {
            const { data: { session }} = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        }
        getSession();

        // Auth değişimlerini dinle
        const { data: { subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });
        
        return () => subscription.unsubscribe();
    }, []);


    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Login error:", error.message);
            throw error;
        }
    }
    const register = async (email, password, name) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    },
                },
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Register error:", error.message);
            throw error;
        }
    };
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Logout error:", error.message);
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )    
}
export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) {
            throw new Error("useAuth must be used within an AuthProvider");
        }
        return context;
    }