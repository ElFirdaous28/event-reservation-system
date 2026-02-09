'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function LogoutButton({ className = '' }: { className?: string }) {
  const { logout } = useAuth();

  return (
    <button
      type='button'
      onClick={logout}
      className={`text-foreground hover:bg-primary/10 hover:text-primary flex w-full items-center gap-3 rounded-lg px-4 py-2 transition-colors ${className}`}
    >
      <LogOut className='h-4 w-4' aria-hidden='true' />
      <span>Logout</span>
    </button>
  );
}
