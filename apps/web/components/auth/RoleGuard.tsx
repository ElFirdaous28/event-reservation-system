// components/shared/RoleGuard.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '../ui';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRole: 'ADMIN' | 'PARTICIPANT';
    redirectTo?: string;
}

export default function RoleGuard({
    children,
    allowedRole,
    redirectTo = '/login'
}: RoleGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push(redirectTo);
            } else if (user?.role !== allowedRole) {
                // If an admin tries to go to participant pages or vice-versa
                const fallback = user?.role === 'ADMIN' ? '/admin/events' : '/participant/my-bookings';
                router.push(fallback);
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRole, router, redirectTo]);

    if (isLoading || !user || user.role !== allowedRole) {
        return (
            <div className="h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return <>{children}</>;
}