'use client';

import { useState } from 'react';
import { usersApi } from '@/lib/api/users';
import { ErrorAlert } from '@/components/ui';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setLoading(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError('Unable to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {error && (
        <ErrorAlert title='Change Failed' message={error} onDismiss={() => setError(null)} />
      )}
      {success && (
        <div className='bg-success/10 border-success/30 text-success rounded border px-4 py-3'>
          {success}
        </div>
      )}

      <div>
        <label className='text-muted block text-sm font-medium'>Current password</label>
        <input
          type='password'
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
        />
      </div>

      <div>
        <label className='text-muted block text-sm font-medium'>New password</label>
        <input
          type='password'
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
        />
      </div>

      <div>
        <label className='text-muted block text-sm font-medium'>Confirm new password</label>
        <input
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
        />
      </div>
      <button
        type='submit'
        className='bg-primary hover:bg-primary-hover rounded px-4 py-2 text-white disabled:opacity-50'
        disabled={loading}
      >
        {loading ? 'Changing...' : 'Change password'}
      </button>
    </form>
  );
}
