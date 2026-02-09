'use client';
import { PageHeader, LoadingSpinner } from '@/components/ui';
import UpdateProfileForm from '@/components/profile/UpdateProfileForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import { useAuth } from '@/providers/AuthProvider';

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='mx-auto flex max-w-2xl justify-center py-8'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-2xl py-8'>
      <PageHeader title='Profile' subtitle='Manage your account' />

      <div className='mt-6 space-y-6'>
        <section className='bg-surface border-border rounded-lg border p-6'>
          <h3 className='mb-4 text-lg font-medium'>Update profile</h3>
          <UpdateProfileForm user={user} />
        </section>

        <section className='bg-surface border-border rounded-lg border p-6'>
          <h3 className='mb-4 text-lg font-medium'>Change password</h3>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
