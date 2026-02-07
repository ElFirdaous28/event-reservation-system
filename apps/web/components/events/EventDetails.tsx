'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Event } from '@repo/shared';
import { eventsApi } from '@/lib/api/events';
import { ErrorAlert, Skeleton } from '@/components/ui';

type EventWithId = Event & { _id?: string };

type EventDetailsProps = {
  id: string;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
      <span className="text-sm font-medium text-muted w-28">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export function EventDetails({ id }: EventDetailsProps) {
  const [event, setEvent] = useState<EventWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventsApi.getOne(id);
        const resolvedEvent = (data?.event ?? data) as EventWithId;
        setEvent(resolvedEvent);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return <Skeleton type="event-details" />;
  }

  if (error) {
    return (
      <ErrorAlert
        title="Error Loading Event"
        message={error}
        onDismiss={() => setError(null)}
      />
    );
  }

  if (!event) {
    return (
      <ErrorAlert
        title="Event Not Found"
        message="We couldn't find the event you’re looking for."
      />
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {event.title}
          </h2>
          <p className="text-muted mt-1">
            {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <span className="text-xs uppercase tracking-wide bg-primary/10 text-primary px-2 py-1 rounded">
          {event.status}
        </span>
      </div>

      <p className="text-foreground mt-6 leading-relaxed">
        {event.description || 'No description available.'}
      </p>

      <div className="mt-6 space-y-3">
        <DetailRow label="Location" value={event.location} />
        <DetailRow label="Capacity" value={`${event.capacity} spots`} />
      </div>
    </div>
  );
}
