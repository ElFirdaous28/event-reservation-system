import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Hero Section */}
      <main className='flex flex-1 flex-col items-center justify-center px-4'>
        <div className='max-w-3xl space-y-6 text-center'>
          <h2 className='text-5xl font-bold'>Discover & Reserve Events</h2>
          <p className='text-muted text-xl'>
            Browse upcoming events and secure your spot with ease.
          </p>
          <div className='flex justify-center gap-4 pt-4'>
            <Link
              href='/events'
              className='bg-primary hover:bg-primary-hover rounded-lg px-8 py-3 text-lg font-medium text-white transition-colors'
            >
              Browse Events
            </Link>
            <Link
              href='/register'
              className='border-primary text-primary hover:bg-primary-soft rounded-lg border-2 px-8 py-3 text-lg font-medium transition-colors'
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
