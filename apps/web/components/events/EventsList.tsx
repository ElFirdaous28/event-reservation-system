'use client';

import { useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api/events';
import { Event, EventStatus } from '@repo/shared';
import { EmptyState, ErrorAlert, Skeleton } from '@/components/ui';
import { EventCard } from './EventCard';

type EventWithId = Event & { _id?: string };

export function EventsList() {
  const [events, setEvents] = useState<EventWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsApi.getAllEvents({
          status: EventStatus.PUBLISHED,
        });
        setEvents((data.events || []) as EventWithId[]);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton type="event-card" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert
        title="Error Loading Events"
        message={error}
        onDismiss={() => setError(null)}
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No Events Available"
        message="There are no events available at the moment. Please check back later!"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event._id ?? event._id} event={event} />
      ))}
    </div>
  );
}
 