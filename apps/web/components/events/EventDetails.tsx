'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Event, ReservationStatus } from '@repo/shared';
import { eventsApi } from '@/lib/api/events';
import { reservationsApi } from '@/lib/api/reservations';
import { ErrorAlert, Skeleton } from '@/components/ui';
import { ReservationButton } from './ReservationButton';

type EventWithId = Event & { _id?: string; availableSeats?: number };

type EventDetailsProps = {
  id: string;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex flex-col sm:flex-row sm:items-center sm:gap-3'>
      <span className='text-muted w-28 text-sm font-medium'>{label}</span>
      <span className='text-foreground'>{value}</span>
    </div>
  );
}

export function EventDetails({ id }: EventDetailsProps) {
  const [event, setEvent] = useState<EventWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventData = async () => {
    try {
      setLoading(true);

      // Fetch event details
      const eventData = await eventsApi.getOne(id);
      const resolvedEvent = (eventData?.event ?? eventData) as EventWithId;
      setEvent(resolvedEvent);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <Skeleton type='event-details' />;
  }

  if (error) {
    return (
      <ErrorAlert title='Error Loading Event' message={error} onDismiss={() => setError(null)} />
    );
  }

  if (!event) {
    return (
      <ErrorAlert
        title='Event Not Found'
        message="We couldn't find the event you’re looking for."
      />
    );
  }

  return (
    <div className='bg-surface border-border rounded-lg border p-6 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-foreground text-2xl font-semibold'>{event.title}</h2>
          <p className='text-muted mt-1'>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <span className='bg-primary/10 text-primary rounded px-2 py-1 text-xs tracking-wide uppercase'>
          {event.status}
        </span>
      </div>

      <p className='text-foreground mt-6 leading-relaxed'>
        {event.description || 'No description available.'}
      </p>

      <div className='mt-6 space-y-3'>
        <DetailRow label='Location' value={event.location} />
        <DetailRow label='Total Capacity' value={`${event.capacity} spots`} />
        <DetailRow
          label='Available Seats'
          value={
            typeof event.availableSeats === 'number'
              ? `${event.availableSeats} spots`
              : `${event.capacity} spots`
          }
        />
      </div>

      <ReservationButton event={event} onSuccess={fetchEventData} />
    </div>
  );
}
