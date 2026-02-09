'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Role } from '@repo/shared';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN]}>
      <div className='bg-background flex min-h-screen'>
        <AdminSidebar />
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
