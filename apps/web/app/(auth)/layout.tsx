import Image from 'next/image';
import { Logo } from '@/components/ui';
import GuestGuard from '@/components/auth/GuestGuard';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className='flex min-h-screen'>
        {/* Left Hero Section */}
        <div className='from-primary/10 via-primary/5 to-background relative hidden overflow-hidden bg-linear-to-br lg:flex lg:w-1/2'>
          {/* Background Image with Overlay */}
          <div className='absolute inset-0'>
            <Image
              src='/images/hero/auth.webp'
              alt='Event reservations hero'
              fill
              className='object-cover opacity-20'
              priority
            />
            <div className='from-primary/20 to-background/40 absolute inset-0 bg-linear-to-br via-transparent' />
          </div>

          {/* Animated Background Elements */}
          <div className='bg-primary/10 absolute top-20 right-20 h-64 w-64 animate-pulse rounded-full blur-3xl' />
          <div className='bg-primary/10 absolute bottom-20 left-20 h-80 w-80 animate-pulse rounded-full blur-3xl delay-700' />

          {/* Content */}
          <div className='relative z-10 mx-auto flex w-full max-w-xl flex-col items-start justify-center p-16'>
            <div className='space-y-8'>
              {/* Logo */}
              <div className='inline-block'>
                <Logo />
              </div>

              {/* Heading */}
              <div className='space-y-4'>
                <h1 className='text-foreground text-5xl leading-tight font-bold'>
                  Welcome to Your
                  <br />
                  <span className='text-primary'>Event Experience</span>
                </h1>
                <p className='text-muted text-lg leading-relaxed'>
                  Discover amazing events, connect with communities, and create unforgettable
                  memories. Your journey starts here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className='bg-background flex flex-1 flex-col'>
          {/* Mobile Logo */}
          <div className='border-border bg-surface/50 border-b p-6 lg:hidden'>
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </GuestGuard>
  );
}
