'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Event, EventStatus } from '@repo/shared';
import { eventsApi } from '@/lib/api/events';
import { ErrorAlert, LoadingSpinner, PageHeader } from '@/components/ui';
import EventForm from '@/components/events/admin/EventForm';
import StatusBadge from '@/components/events/admin/StatusBadge';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const eventId = useMemo(() => params?.id as string, [params]);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    eventsApi
      .getOne(eventId)
      .then((res) => {
        if (mounted) setEvent(res);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError('Unable to load event');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleUpdate = async (values: {
    title: string;
    description?: string;
    date: string;
    location: string;
    capacity: number;
  }) => {
    if (!eventId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await eventsApi.update(eventId, values);
      setEvent(updated);
    } catch (err) {
      console.error(err);
      setError('Unable to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: EventStatus) => {
    if (!eventId) return;
    setStatusLoading(true);
    setError(null);
    try {
      const updated = await eventsApi.changeStatus(eventId, { status });
      setEvent(updated);
    } catch (err) {
      console.error(err);
      setError('Unable to change status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (!event) {
    return (
      <div className='max-w-3xl'>
        <ErrorAlert title='Not Found' message='Event not found' />
      </div>
    );
  }

  const dateValue = format(new Date(event.date), 'yyyy-MM-dd');

  return (
    <div className='max-w-3xl space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <PageHeader title='Edit Event' subtitle='Update event details' />
        <button
          type='button'
          onClick={() => router.push('/admin/events')}
          className='border-border hover:bg-surface rounded border px-4 py-2'
        >
          Back to list
        </button>
      </div>

      {error && (
        <ErrorAlert title='Update Failed' message={error} onDismiss={() => setError(null)} />
      )}

      <div className='bg-surface border-border space-y-4 rounded-lg border p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-muted text-sm'>Status</p>
            <StatusBadge status={event.status} />
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => handleStatusChange(EventStatus.PUBLISHED)}
              className='border-border hover:bg-surface rounded border px-3 py-1 disabled:opacity-50'
              disabled={statusLoading || event.status === EventStatus.PUBLISHED}
            >
              Publish
            </button>
            <button
              type='button'
              onClick={() => handleStatusChange(EventStatus.CANCELED)}
              className='border-border hover:bg-surface rounded border px-3 py-1 disabled:opacity-50'
              disabled={statusLoading || event.status === EventStatus.CANCELED}
            >
              Cancel
            </button>
          </div>
        </div>

        <EventForm
          initialValues={{
            title: event.title,
            description: event.description ?? '',
            date: dateValue,
            location: event.location,
            capacity: event.capacity,
          }}
          onSubmit={handleUpdate}
          submitLabel='Save changes'
          loading={saving}
        />
      </div>
    </div>
  );
}
