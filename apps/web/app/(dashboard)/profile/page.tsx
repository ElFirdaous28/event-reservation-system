'use client';
import { PageHeader, LoadingSpinner } from '@/components/ui';
import UpdateProfileForm from '@/components/profile/UpdateProfileForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import { useAuth } from '@/providers/AuthProvider';

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <PageHeader title="Profile" subtitle="Manage your account" />

      <div className="space-y-6 mt-6">
        <section className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Update profile</h3>
          <UpdateProfileForm user={user} />
        </section>

        <section className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Change password</h3>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
