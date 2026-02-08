'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Role } from '@repo/shared';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <div className="flex min-h-screen bg-background">
                <AdminSidebar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
