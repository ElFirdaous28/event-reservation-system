'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api/users';
import { ErrorAlert } from '@/components/ui';

export default function UpdateProfileForm({ user }: { user: any }) {
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.updateProfile({ fullName, email });
      setSuccess('Profile updated');
    } catch (err) {
      // console.error(err);
      setError('Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {error && (
        <ErrorAlert title='Update Failed' message={error} onDismiss={() => setError(null)} />
      )}
      {success && (
        <div className='bg-success/10 border-success/30 text-success rounded border px-4 py-3'>
          {success}
        </div>
      )}
      <div>
        <label className='text-muted block text-sm font-medium'>Full Name</label>
        <input
          type='text'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
        />
      </div>
      <div>
        <label className='text-muted block text-sm font-medium'>Email</label>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
        />
      </div>
      <button
        type='submit'
        className='bg-primary hover:bg-primary-hover rounded px-4 py-2 text-white disabled:opacity-50'
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
