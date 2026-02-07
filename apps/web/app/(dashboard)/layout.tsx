'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ParticipantSidebar } from '@/components/layout/ParticipantSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="flex min-h-screen bg-background">
      {isAdminRoute ? <AdminSidebar /> : <ParticipantSidebar />}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
