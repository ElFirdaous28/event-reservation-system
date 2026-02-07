import Link from 'next/link';
import { format } from 'date-fns';
import { Event } from '@repo/shared';

type EventWithId = Event & { _id?: string };

const getEventId = (event: EventWithId) => event._id ?? event.id;

function EventMeta({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center text-sm text-muted">
      <span className="w-4 h-4 mr-2 text-muted">{icon}</span>
      {children}
    </div>
  );
}

export function EventCard({ event }: { event: EventWithId }) {
  const eventId = getEventId(event);

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {event.title}
        </h2>

        <p className="text-muted mb-4 line-clamp-3">
          {event.description || 'No description available'}
        </p>

        <div className="space-y-2 mb-4">
          <EventMeta
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          >
            {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
          </EventMeta>

          <EventMeta
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          >
            {event.location}
          </EventMeta>

          <EventMeta
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          >
            {event.capacity} spots available
          </EventMeta>
        </div>

        {eventId ? (
          <Link
            href={`/events/${eventId}`}
            className="block w-full text-center bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View Details
          </Link>
        ) : (
          <button
            type="button"
            className="block w-full text-center bg-primary/60 text-white font-medium py-2 px-4 rounded cursor-not-allowed"
            disabled
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
