import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
    avatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    setAuth: (user: User, token: string) => void;
    loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: false,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data } = await authAPI.login({ email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (userData) => {
        set({ isLoading: true });
        try {
            const { data } = await authAPI.register(userData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    loadUser: async () => {
        try {
            const { data } = await authAPI.getProfile();
            set({ user: { id: data.id, email: data.email, name: data.name, role: data.role, avatar: data.avatar } });
        } catch {
            set({ user: null, token: null, isAuthenticated: false });
        }
    },
}));
