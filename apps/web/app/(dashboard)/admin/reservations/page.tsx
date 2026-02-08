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
    filter === 'all'
      ? reservations
      : reservations.filter((r) => r.status === filter);

  const statusCounts = {
    all: stats.total,
    [ReservationStatus.PENDING]: stats.pending,
    [ReservationStatus.CONFIRMED]: stats.confirmed,
    [ReservationStatus.REFUSED]: stats.refused,
    [ReservationStatus.CANCELED]: stats.canceled,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Manage Reservations</h1>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton type="reservation" count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Manage Reservations</h1>
        <ErrorAlert
          title="Error Loading Reservations"
          message={error}
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Reservations</h1>
        <p className="text-muted">View and manage all event reservations</p>
      </div>

      {/* Statistics Cards */}
      {reservations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-xs font-medium text-muted uppercase">Total</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {statusCounts.all}
            </p>
          </div>
          <div
            className="bg-surface border border-border rounded-lg p-4"
            style={{ borderLeftColor: 'var(--warning)', borderLeftWidth: '4px' }}
          >
            <p className="text-xs font-medium text-muted uppercase">Pending</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--warning)' }}>
              {statusCounts[ReservationStatus.PENDING]}
            </p>
          </div>
          <div
            className="bg-surface border border-border rounded-lg p-4"
            style={{ borderLeftColor: 'var(--success)', borderLeftWidth: '4px' }}
          >
            <p className="text-xs font-medium text-muted uppercase">Confirmed</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--success)' }}>
              {statusCounts[ReservationStatus.CONFIRMED]}
            </p>
          </div>
          <div
            className="bg-surface border border-border rounded-lg p-4"
            style={{ borderLeftColor: 'var(--error)', borderLeftWidth: '4px' }}
          >
            <p className="text-xs font-medium text-muted uppercase">Refused</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--error)' }}>
              {statusCounts[ReservationStatus.REFUSED]}
            </p>
          </div>
          <div
            className="bg-surface border border-border rounded-lg p-4"
            style={{
              borderLeftColor: 'var(--text-muted)',
              borderLeftWidth: '4px',
            }}
          >
            <p className="text-xs font-medium text-muted uppercase">Canceled</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-muted)' }}>
              {statusCounts[ReservationStatus.CANCELED]}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {reservations.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === 'all'
                ? 'text-white'
                : 'bg-surface border border-border text-foreground hover:bg-gray-50'
            }`}
            style={filter === 'all' ? { backgroundColor: 'var(--primary)' } : {}}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.PENDING)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === ReservationStatus.PENDING
                ? 'text-white'
                : 'bg-surface border border-border text-foreground hover:bg-gray-50'
            }`}
            style={
              filter === ReservationStatus.PENDING
                ? { backgroundColor: 'var(--warning)' }
                : {}
            }
          >
            Pending ({statusCounts[ReservationStatus.PENDING]})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.CONFIRMED)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === ReservationStatus.CONFIRMED
                ? 'text-white'
                : 'bg-surface border border-border text-foreground hover:bg-gray-50'
            }`}
            style={
              filter === ReservationStatus.CONFIRMED
                ? { backgroundColor: 'var(--success)' }
                : {}
            }
          >
            Confirmed ({statusCounts[ReservationStatus.CONFIRMED]})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.REFUSED)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === ReservationStatus.REFUSED
                ? 'text-white'
                : 'bg-surface border border-border text-foreground hover:bg-gray-50'
            }`}
            style={
              filter === ReservationStatus.REFUSED
                ? { backgroundColor: 'var(--error)' }
                : {}
            }
          >
            Refused ({statusCounts[ReservationStatus.REFUSED]})
          </button>
          <button
            onClick={() => setFilter(ReservationStatus.CANCELED)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === ReservationStatus.CANCELED
                ? 'text-white'
                : 'bg-surface border border-border text-foreground hover:bg-gray-50'
            }`}
            style={
              filter === ReservationStatus.CANCELED
                ? { backgroundColor: 'var(--text-muted)' }
                : {}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
