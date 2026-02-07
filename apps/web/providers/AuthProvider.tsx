'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authApi } from '@/lib/api';
import { JwtPayload } from '@repo/shared';
import { jwtDecode } from 'jwt-decode';
import { setAccessToken } from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: JwtPayload | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<JwtPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Try to get a new access token using refresh token in httpOnly cookie
                const response = await authApi.refresh();
                const decoded = jwtDecode<JwtPayload>(response.accessToken);
                setAccessToken(response.accessToken);
                setUser(decoded);
            } catch (error) {
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Listen for logout events (from axios interceptor)
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setAccessToken(null);
            router.push('/login');
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, [router]);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        const decoded = jwtDecode<JwtPayload>(response.accessToken);
        setAccessToken(response.accessToken);
        setUser(decoded);
    }, []);

    const register = useCallback(async (fullName: string, email: string, password: string) => {
        const response = await authApi.register({
            fullName,
            email,
            password,
        });
        const decoded = jwtDecode<JwtPayload>(response.accessToken);
        setAccessToken(response.accessToken);
        setUser(decoded);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // ignore errors on logout
        } finally {
            setAccessToken(null);
            setUser(null);
            router.push('/login');
        }
    }, [router]);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
