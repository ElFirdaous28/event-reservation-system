import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className='flex flex-1 items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        <div className='space-y-6'>
          <div className='text-center'>
            <h1 className='text-3xl font-bold'>Create Account</h1>
            <p className='text-muted mt-2'>
              Already have an account?{' '}
              <Link href='/login' className='text-primary font-medium hover:underline'>
                Login here
              </Link>
            </p>
          </div>

          <div className='bg-surface border-border rounded-lg border p-6'>
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}
