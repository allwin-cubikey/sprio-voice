import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ─── Auth Store ───────────────────────────────────────────────────────────────
export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    plan: 'free' | 'starter' | 'growth' | 'enterprise';
    avatarInitials: string;
    createdAt: string;
    isAdmin: boolean;
}

interface AuthStore {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: { firstName: string; lastName: string; email: string; company: string; password: string }) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<AuthUser>) => void;
    clearError: () => void;
    sendPasswordReset: (email: string) => Promise<void>;
}

// Demo users registry
const DEMO_USERS: Array<AuthUser & { password: string }> = [
    // ── Admin ─────────────────────────────────────────────────────────────────
    {
        id: 'usr_admin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@sprio.io',
        password: 'admin1234',
        company: 'Sprio Labs',
        plan: 'enterprise',
        avatarInitials: 'SA',
        createdAt: '2024-01-01T00:00:00Z',
        isAdmin: true,
    },
    // ── Regular user ──────────────────────────────────────────────────────────
    {
        id: 'usr_demo',
        firstName: 'John',
        lastName: 'Doe',
        email: 'demo@sprio.io',
        password: 'demo1234',
        company: 'Acme Corp',
        plan: 'growth',
        avatarInitials: 'JD',
        createdAt: '2025-10-01T00:00:00Z',
        isAdmin: false,
    },
];

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            login: async (email, password) => {
                set({ loading: true, error: null });
                await delay(800);
                const found = DEMO_USERS.find(
                    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
                );
                if (!found) {
                    set({
                        loading: false,
                        error: 'Invalid email or password. Try demo@sprio.io / demo1234 or admin@sprio.io / admin1234',
                    });
                    return;
                }
                const { password: _pw, ...user } = found;
                set({ loading: false, isAuthenticated: true, user, error: null });
            },

            signup: async ({ firstName, lastName, email, company, password }) => {
                set({ loading: true, error: null });
                await delay(1000);
                if (DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                    set({ loading: false, error: 'An account with this email already exists.' });
                    return;
                }
                const newUser: AuthUser = {
                    id: `usr_${Date.now()}`,
                    firstName, lastName, email, company,
                    plan: 'free',
                    avatarInitials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
                    createdAt: new Date().toISOString(),
                    isAdmin: false,
                };
                DEMO_USERS.push({ ...newUser, password });
                set({ loading: false, isAuthenticated: true, user: newUser, error: null });
            },

            logout: () => set({ user: null, isAuthenticated: false, error: null }),

            updateProfile: (data) => {
                const user = get().user;
                if (!user) return;
                set({ user: { ...user, ...data } });
            },

            clearError: () => set({ error: null }),

            sendPasswordReset: async (_email) => {
                set({ loading: true, error: null });
                await delay(800);
                set({ loading: false });
            },
        }),
        { name: 'sprio-auth', version: 2 } // bump version to clear old persisted state
    )
);
