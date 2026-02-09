'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Event, EventStatus, EventsResponse } from '@repo/shared';
import { eventsApi } from '@/lib/api/events';
import { EmptyState, ErrorAlert, LoadingSpinner, PageHeader } from '@/components/ui';
import StatusBadge from '@/components/events/admin/StatusBadge';

export default function Page() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | EventStatus>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(() => {
    return {
      search: search.trim() || undefined,
      status: status === 'all' ? undefined : status,
      page,
      limit,
    };
  }, [search, status, page, limit]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    eventsApi
      .getMyEvents(filters)
      .then((res) => {
        if (mounted) setData(res);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError('Unable to load events');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filters]);

  const totalPages = data?.totalPages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <PageHeader title='Manage Events' subtitle='Create, edit, and publish events' />
        <Link
          href='/admin/events/create'
          className='bg-primary hover:bg-primary-hover rounded px-4 py-2 text-white'
        >
          Create Event
        </Link>
      </div>

      <div className='bg-surface border-border rounded-lg border p-4'>
        <div className='grid gap-4 md:grid-cols-4'>
          <div className='md:col-span-2'>
            <label className='text-muted block text-sm font-medium'>Search</label>
            <input
              type='text'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder='Search by title, description, or location'
              className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
            />
          </div>

          <div>
            <label className='text-muted block text-sm font-medium'>Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'all' | EventStatus);
                setPage(1);
              }}
              className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
            >
              <option value='all'>All</option>
              <option value={EventStatus.DRAFT}>Draft</option>
              <option value={EventStatus.PUBLISHED}>Published</option>
              <option value={EventStatus.CANCELED}>Canceled</option>
            </select>
          </div>

          <div>
            <label className='text-muted block text-sm font-medium'>Per page</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className='border-border bg-surface text-foreground focus:ring-primary mt-1 block w-full rounded border px-3 py-2 focus:ring-2 focus:outline-none'
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorAlert title='Load Failed' message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className='flex justify-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      ) : data?.events?.length ? (
        <div className='bg-surface border-border overflow-hidden rounded-lg border'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-background/60 border-border border-b'>
                <tr>
                  <th className='px-4 py-3 font-medium'>Title</th>
                  <th className='px-4 py-3 font-medium'>Date</th>
                  <th className='px-4 py-3 font-medium'>Location</th>
                  <th className='px-4 py-3 font-medium'>Capacity</th>
                  <th className='px-4 py-3 font-medium'>Available</th>
                  <th className='px-4 py-3 font-medium'>Status</th>
                  <th className='px-4 py-3 font-medium'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => {
                  return (
                    <tr key={event._id} className='border-border border-b last:border-b-0'>
                      <td className='text-foreground px-4 py-3 font-medium'>{event.title}</td>
                      <td className='text-muted px-4 py-3'>
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </td>
                      <td className='text-muted px-4 py-3'>{event.location}</td>
                      <td className='text-muted px-4 py-3'>{event.capacity}</td>
                      <td className='text-muted px-4 py-3'>
                        {typeof (event as any).availableSeats === 'number'
                          ? (event as any).availableSeats
                          : event.capacity}
                      </td>
                      <td className='px-4 py-3'>
                        <StatusBadge status={event.status} />
                      </td>
                      <td className='px-4 py-3'>
                        {event._id ? (
                          <Link
                            href={`/admin/events/${event._id}`}
                            className='text-primary hover:underline'
                          >
                            Edit
                          </Link>
                        ) : (
                          <span className='text-muted'>N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className='border-border flex items-center justify-between border-t px-4 py-3'>
            <p className='text-muted text-sm'>
              Page {data.page} of {data.totalPages}
            </p>
            <div className='flex gap-2'>
              <button
                type='button'
                className='border-border rounded border px-3 py-1 disabled:opacity-50'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
              >
                Previous
              </button>
              <button
                type='button'
                className='border-border rounded border px-3 py-1 disabled:opacity-50'
                onClick={() => setPage((p) => p + 1)}
                disabled={!canNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title='No events found'
          message='Try adjusting your filters or create a new event.'
          action={{
            label: 'Create Event',
            onClick: () => (window.location.href = '/admin/events/create'),
          }}
        />
      )}
    </div>
  );
}
