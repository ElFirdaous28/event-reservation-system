'use client';

import { useEffect, useState } from 'react';
import { reservationsApi } from '@/lib/api/reservations';
import { EmptyState, ErrorAlert, Skeleton } from '@/components/ui';
import { ReservationCard } from '@/components/reservations';
import { ReservationStatus, SafeReservation } from '@repo/shared';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<SafeReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ReservationStatus>('all');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationsApi.getMyReservations();
      setReservations(data);
    } catch (err: any) {
      // console.error('Error fetching reservations:', err);
      setError(err?.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations =
    filter === 'all' ? reservations : reservations.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-foreground mb-8 text-3xl font-bold'>My Reservations</h1>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <Skeleton type='reservation' count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-foreground mb-8 text-3xl font-bold'>My Reservations</h1>
        <ErrorAlert
          title='Error Loading Reservations'
          message={error}
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-foreground mb-2 text-3xl font-bold'>My Reservations</h1>
        <p className='text-muted'>View and manage your event reservations</p>
      </div>

      {/* Filter Tabs */}
      {reservations.length > 0 && (
        <div className='mb-6 flex flex-wrap gap-2'>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
          >
            All ({reservations.length})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.CONFIRMED)}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              filter === ReservationStatus.CONFIRMED
                ? 'bg-primary text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
          >
            Confirmed ({reservations.filter((r) => r.status === ReservationStatus.CONFIRMED).length}
            )
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.PENDING)}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              filter === ReservationStatus.PENDING
                ? 'bg-primary text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
          >
            Pending ({reservations.filter((r) => r.status === ReservationStatus.PENDING).length})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.CANCELED)}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              filter === ReservationStatus.CANCELED
                ? 'bg-primary text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
          >
            Canceled ({reservations.filter((r) => r.status === ReservationStatus.CANCELED).length})
          </button>
        </div>
      )}

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No Reservations' : `No ${filter} Reservations`}
          message={
            filter === 'all'
              ? "You haven't made any reservations yet. Browse events to get started!"
              : `You don't have any ${filter.toLowerCase()} reservations.`
          }
        />
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation._id || reservation._id}
              reservation={reservation}
              onUpdate={fetchReservations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
