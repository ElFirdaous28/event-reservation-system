'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Role } from '@repo/shared';
import { ParticipantSidebar } from '@/components/layout/ParticipantSidebar';

export default function ParticipantLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={[Role.PARTICIPANT]}>
      <div className='bg-background flex min-h-screen'>
        <ParticipantSidebar />
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
