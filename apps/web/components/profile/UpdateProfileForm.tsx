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
      console.error(err);
      setError('Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <ErrorAlert
          title="Update Failed"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
      {success && (
        <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded">
          {success}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-muted">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-muted">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
