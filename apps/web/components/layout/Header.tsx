'use client';

import Link from 'next/link';
import { Logo } from '../ui/Logo';
import { Role } from '@repo/shared';
import { useAuth } from '@/providers/AuthProvider';
import LogoutButton from './LogoutButton';

export function Header() {
  const { isAuthenticated } = useAuth();
  console.log(isAuthenticated);

  return (
    <header className='border-border bg-surface border-b'>
      <div className='container mx-auto flex items-center justify-between px-4 py-4'>
        <Logo className='h-10 w-auto' />
        <nav className='flex gap-4'>
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <>
              <Link
                href='/login'
                className='text-foreground hover:text-primary px-4 py-2 transition-colors'
              >
                Login
              </Link>
              <Link
                href='/register'
                className='bg-primary hover:bg-primary-hover rounded-lg px-4 py-2 text-white transition-colors'
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
