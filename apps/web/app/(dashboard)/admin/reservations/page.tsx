'use client';

import { useEffect, useState } from 'react';
import { reservationsApi } from '@/lib/api/reservations';
import { SafeReservation, ReservationStatus } from '@repo/shared';
import { EmptyState, ErrorAlert, Skeleton } from '@/components/ui';
import { AdminReservationCard } from '@/components/reservations';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<SafeReservation[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    refused: 0,
    canceled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ReservationStatus>('all');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reservationsData, statsData] = await Promise.all([
        reservationsApi.getAll(),
        reservationsApi.getStats(),
      ]);
      setReservations(reservationsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching reservations:', err);
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

  const statusCounts = {
    all: stats.total,
    [ReservationStatus.PENDING]: stats.pending,
    [ReservationStatus.CONFIRMED]: stats.confirmed,
    [ReservationStatus.REFUSED]: stats.refused,
    [ReservationStatus.CANCELED]: stats.canceled,
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-foreground mb-8 text-3xl font-bold'>Manage Reservations</h1>
        <div className='grid grid-cols-1 gap-6'>
          <Skeleton type='reservation' count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-foreground mb-8 text-3xl font-bold'>Manage Reservations</h1>
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
        <h1 className='text-foreground mb-2 text-3xl font-bold'>Manage Reservations</h1>
        <p className='text-muted'>View and manage all event reservations</p>
      </div>

      {/* Statistics Cards */}
      {reservations.length > 0 && (
        <div className='mb-8 grid grid-cols-2 gap-4 md:grid-cols-5'>
          <div className='bg-surface border-border rounded-lg border p-4'>
            <p className='text-muted text-xs font-medium uppercase'>Total</p>
            <p className='text-foreground mt-1 text-2xl font-bold'>{statusCounts.all}</p>
          </div>
          <div
            className='bg-surface border-border rounded-lg border p-4'
            style={{
              borderLeftColor: 'var(--warning)',
              borderLeftWidth: '4px',
            }}
          >
            <p className='text-muted text-xs font-medium uppercase'>Pending</p>
            <p className='mt-1 text-2xl font-bold' style={{ color: 'var(--warning)' }}>
              {statusCounts[ReservationStatus.PENDING]}
            </p>
          </div>
          <div
            className='bg-surface border-border rounded-lg border p-4'
            style={{
              borderLeftColor: 'var(--success)',
              borderLeftWidth: '4px',
            }}
          >
            <p className='text-muted text-xs font-medium uppercase'>Confirmed</p>
            <p className='mt-1 text-2xl font-bold' style={{ color: 'var(--success)' }}>
              {statusCounts[ReservationStatus.CONFIRMED]}
            </p>
          </div>
          <div
            className='bg-surface border-border rounded-lg border p-4'
            style={{ borderLeftColor: 'var(--error)', borderLeftWidth: '4px' }}
          >
            <p className='text-muted text-xs font-medium uppercase'>Refused</p>
            <p className='mt-1 text-2xl font-bold' style={{ color: 'var(--error)' }}>
              {statusCounts[ReservationStatus.REFUSED]}
            </p>
          </div>
          <div
            className='bg-surface border-border rounded-lg border p-4'
            style={{
              borderLeftColor: 'var(--text-muted)',
              borderLeftWidth: '4px',
            }}
          >
            <p className='text-muted text-xs font-medium uppercase'>Canceled</p>
            <p className='mt-1 text-2xl font-bold' style={{ color: 'var(--text-muted)' }}>
              {statusCounts[ReservationStatus.CANCELED]}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {reservations.length > 0 && (
        <div className='border-border mb-6 flex flex-wrap gap-2 border-b pb-4'>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
            style={filter === 'all' ? { backgroundColor: 'var(--primary)' } : {}}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.PENDING)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === ReservationStatus.PENDING
                ? 'text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
            style={
              filter === ReservationStatus.PENDING ? { backgroundColor: 'var(--warning)' } : {}
            }
          >
            Pending ({statusCounts[ReservationStatus.PENDING]})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.CONFIRMED)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === ReservationStatus.CONFIRMED
                ? 'text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
            style={
              filter === ReservationStatus.CONFIRMED ? { backgroundColor: 'var(--success)' } : {}
            }
          >
            Confirmed ({statusCounts[ReservationStatus.CONFIRMED]})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.REFUSED)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === ReservationStatus.REFUSED
                ? 'text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
            style={filter === ReservationStatus.REFUSED ? { backgroundColor: 'var(--error)' } : {}}
          >
            Refused ({statusCounts[ReservationStatus.REFUSED]})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.CANCELED)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === ReservationStatus.CANCELED
                ? 'text-white'
                : 'bg-surface border-border text-foreground border hover:bg-gray-50'
            }`}
            style={
              filter === ReservationStatus.CANCELED ? { backgroundColor: 'var(--text-muted)' } : {}
            }
          >
            Canceled ({statusCounts[ReservationStatus.CANCELED]})
          </button>
        </div>
      )}

      {/* Reservations Grid */}
      {filteredReservations.length === 0 ? (
        <EmptyState
          title={filter === 'all' ? 'No Reservations' : `No ${filter} Reservations`}
          message={
            filter === 'all'
              ? 'No reservations found. Check back later!'
              : `No ${filter.toLowerCase()} reservations found.`
          }
        />
      ) : (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {filteredReservations.map((reservation) => (
            <AdminReservationCard
              key={reservation._id}
              reservation={reservation}
              onUpdate={fetchReservations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
