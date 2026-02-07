import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted mt-2">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}