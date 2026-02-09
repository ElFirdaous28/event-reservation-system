'use client';

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/${user.role.toLowerCase()}/dashboard`);
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) return <div>Loading...</div>;

  return !isAuthenticated ? <>{children}</> : null;
}
