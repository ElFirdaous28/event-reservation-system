import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-muted mt-2">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}