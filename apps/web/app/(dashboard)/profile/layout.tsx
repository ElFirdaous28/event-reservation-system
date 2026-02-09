'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ParticipantSidebar } from '@/components/layout/ParticipantSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Role } from '@repo/shared/dist/enums/role.enum';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
const { user } = useAuth();
  return (
    <ProtectedRoute allowedRoles={[Role.ADMIN, Role.PARTICIPANT]}>
      <div className="flex min-h-screen bg-background">
        {user && user.role === Role.ADMIN ? <AdminSidebar /> : <ParticipantSidebar />}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
