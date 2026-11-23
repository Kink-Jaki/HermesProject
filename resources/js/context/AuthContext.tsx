import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchCurrentUser, isAdminRole, login as loginRequest, logout as logoutRequest } from '../services/authService';
import { UNAUTHORIZED_EVENT } from '../services/http';
import type { AuthSession, AuthUser, LoginCredentials } from '../types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
    user: AuthUser | null;
    status: AuthStatus;
    isAdmin: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthSession>;
    logout: () => Promise<void>;
    refresh: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');

    const refresh = useCallback(async () => {
        try {
            const currentUser = await fetchCurrentUser();

            setUser(currentUser);
            setStatus('authenticated');

            return currentUser;
        } catch {
            setUser(null);
            setStatus('unauthenticated');

            return null;
        }
    }, []);

    useEffect(() => {
        void refresh();

        const handleUnauthorized = () => {
            setUser(null);
            setStatus('unauthenticated');
        };

        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    }, [refresh]);

    const login = useCallback(async (credentials: LoginCredentials) => {
        const session = await loginRequest(credentials);

        setUser(session.user);
        setStatus('authenticated');

        return session;
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } finally {
            setUser(null);
            setStatus('unauthenticated');
        }
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        status,
        isAdmin: isAdminRole(user?.role ?? ''),
        login,
        logout,
        refresh,
    }), [user, status, login, logout, refresh]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth harus dipakai di dalam AuthProvider.');
    }

    return context;
}
