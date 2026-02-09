'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, ErrorAlert } from '@/components/ui';
import EventForm from '@/components/events/admin/EventForm';
import { eventsApi } from '@/lib/api/events';

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (values: {
    title: string;
    description?: string;
    date: string;
    location: string;
    capacity: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await eventsApi.create(values);
      router.push('/admin/events');
    } catch (err) {
      console.error(err);
      setError('Unable to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-3xl space-y-6'>
      <PageHeader title='Create Event' subtitle='Add a new event' />

      {error && (
        <ErrorAlert title='Create Failed' message={error} onDismiss={() => setError(null)} />
      )}

      <div className='bg-surface border-border rounded-lg border p-6'>
        <EventForm
          initialValues={{
            title: '',
            description: '',
            date: '',
            location: '',
            capacity: 1,
          }}
          onSubmit={handleCreate}
          submitLabel='Create event'
          loading={loading}
        />
      </div>
    </div>
  );
}
