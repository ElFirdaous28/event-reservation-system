'use client';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user) {
                // Role check: prevent participants from accessing /admin
                if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
                    router.push('/participant/my-bookings');
                }
                // Prevent admins from getting lost in participant pages
                if (pathname.startsWith('/participant') && user.role === 'ADMIN') {
                    router.push('/admin/events');
                }
            }
        }
    }, [isLoading, isAuthenticated, user, pathname, router]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Add your Sidebar here */}
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}