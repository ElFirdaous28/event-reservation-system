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
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <ErrorAlert
          title="Change Failed"
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
        <label className="block text-sm font-medium text-muted">Current password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Changing...' : 'Change password'}
      </button>
    </form>
  );
}
