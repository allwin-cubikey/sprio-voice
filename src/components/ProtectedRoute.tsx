import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';

/**
 * ProtectedRoute — requires authentication.
 * Unauthenticated → /login (preserves intended URL in state).
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

/**
 * PublicRoute — auth pages only.
 * Authenticated admins → /admin, regular users → /dashboard.
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to={user?.isAdmin ? '/admin' : '/dashboard'} replace />;
    }

    return <>{children}</>;
}

/**
 * AdminRoute — requires isAdmin flag.
 * Non-admin authenticated users → /dashboard.
 * Unauthenticated → /login.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user?.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
