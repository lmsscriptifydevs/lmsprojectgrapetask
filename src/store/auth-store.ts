'use client';

import { create } from 'zustand';
import { authApi, type LoginInput, type RegisterInput } from '@/lib/api';
import { dashboardForRole } from '@/lib/routes';
import type { User } from '@/types/domain';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  hydrate: () => void;
  login: (input: LoginInput) => Promise<string>;
  register: (input: RegisterInput) => Promise<string>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('grapetask_lms_token');
    const rawUser = window.localStorage.getItem('grapetask_lms_user');
    set({ token, user: rawUser ? JSON.parse(rawUser) : null });
  },
  login: async (input) => {
    set({ loading: true, error: null });
    try {
      const session = await authApi.login(input);
      window.localStorage.setItem('grapetask_lms_token', session.accessToken);
      window.localStorage.setItem('grapetask_lms_user', JSON.stringify(session.user));
      set({ token: session.accessToken, user: session.user, loading: false });
      return dashboardForRole(session.user.role);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },
  register: async (input) => {
    set({ loading: true, error: null });
    try {
      const session = await authApi.register(input);
      window.localStorage.setItem('grapetask_lms_token', session.accessToken);
      window.localStorage.setItem('grapetask_lms_user', JSON.stringify(session.user));
      set({ token: session.accessToken, user: session.user, loading: false });
      return dashboardForRole(session.user.role);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, loading: false });
      throw error;
    }
  },
  logout: () => {
    window.localStorage.removeItem('grapetask_lms_token');
    window.localStorage.removeItem('grapetask_lms_user');
    set({ token: null, user: null });
  },
}));
