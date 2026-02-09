'use client';

import { format } from 'date-fns';
import { ReservationStatus, SafeReservation } from '@repo/shared';
import { useState } from 'react';
import { reservationsApi } from '@/lib/api/reservations';
import { Download } from 'lucide-react';

type AdminReservationCardProps = {
  reservation: SafeReservation;
  onUpdate: () => void;
};

const statusConfig = {
  [ReservationStatus.PENDING]: {
    label: 'Pending',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
    badgeBg: 'bg-warning',
  },
  [ReservationStatus.CONFIRMED]: {
    label: 'Confirmed',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
    badgeBg: 'bg-success',
  },
  [ReservationStatus.REFUSED]: {
    label: 'Refused',
    bgColor: 'bg-error/10',
    textColor: 'text-error',
    badgeBg: 'bg-error',
  },
  [ReservationStatus.CANCELED]: {
    label: 'Canceled',
    bgColor: 'bg-muted/10',
    textColor: 'text-muted',
    badgeBg: 'bg-muted',
  },
};

export function AdminReservationCard({ reservation, onUpdate }: AdminReservationCardProps) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    try {
      setLoading(true);
      setError(null);
      await reservationsApi.changeStatus(reservation._id, {
        status: newStatus,
      });
      onUpdate();
    } catch (err: any) {
      // console.error('Error updating reservation:', err);
      setError(err?.response?.data?.message || 'Failed to update reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      setDownloading(true);
      setError(null);
      const pdfBlob = await reservationsApi.downloadTicket(reservation._id);

      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${reservation._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      // console.error('Error downloading ticket:', err);
      setError(err?.response?.data?.message || 'Failed to download ticket');
    } finally {
      setDownloading(false);
    }
  };

  const statusInfo = statusConfig[reservation.status];
  const canChangeStatus =
    reservation.status !== ReservationStatus.CANCELED &&
    reservation.status !== ReservationStatus.REFUSED;

  return (
    <div className='bg-surface border-border overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md'>
      {/* Status Header */}
      <div
        style={{
          backgroundColor: `var(--${statusInfo.textColor.split('-')[1]})10`,
        }}
        className='border-border flex items-center justify-between border-b px-6 py-4'
      >
        <div>
          <h3 className='text-foreground text-lg font-semibold'>{reservation.event.title}</h3>
          <p className='text-muted mt-1 text-sm'>
            User: {reservation.user.fullName} ({reservation.user.email})
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-wide text-white uppercase ${statusInfo.badgeBg}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Content */}
      <div className='px-6 py-4'>
        <div className='mb-4 grid grid-cols-2 gap-4'>
          <div>
            <p className='text-muted text-xs font-medium'>Event Date</p>
            <p className='text-foreground text-sm font-semibold'>
              {format(new Date(reservation.event.date), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className='text-muted text-xs font-medium'>Reserved On</p>
            <p className='text-foreground text-sm font-semibold'>
              {format(new Date(reservation.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className='text-muted text-xs font-medium'>Location</p>
            <p className='text-foreground text-sm'>{reservation.event.location}</p>
          </div>
          <div>
            <p className='text-muted text-xs font-medium'>User Email</p>
            <p className='text-foreground text-sm'>{reservation.user.email}</p>
          </div>
          <div>
            <p className='text-muted text-xs font-medium'>Capacity</p>
            <p className='text-foreground text-sm'>{reservation.event.capacity} spots</p>
          </div>
          <div>
            <p className='text-muted text-xs font-medium'>Available</p>
            <p className='text-foreground text-sm'>
              {typeof (reservation.event as any).availableSeats === 'number'
                ? `${(reservation.event as any).availableSeats} spots`
                : `${reservation.event.capacity} spots`}
            </p>
          </div>
        </div>

        {error && (
          <div className='bg-error/10 border-error/20 text-error mb-4 rounded-lg border p-3 text-sm'>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className='border-border flex flex-wrap gap-2 border-t pt-4'>
          {canChangeStatus && (
            <>
              {reservation.status !== ReservationStatus.CONFIRMED && (
                <button
                  onClick={() => handleStatusChange(ReservationStatus.CONFIRMED)}
                  disabled={loading}
                  style={{
                    backgroundColor: 'var(--success)',
                    color: '#fff',
                  }}
                  className='flex-1 rounded px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {loading ? 'Updating...' : '✓ Confirm'}
                </button>
              )}
              {reservation.status !== ReservationStatus.REFUSED && (
                <button
                  onClick={() => handleStatusChange(ReservationStatus.REFUSED)}
                  disabled={loading}
                  style={{
                    backgroundColor: 'var(--error)',
                    color: '#fff',
                  }}
                  className='flex-1 rounded px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {loading ? 'Updating...' : '✗ Refuse'}
                </button>
              )}
            </>
          )}
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
            }}
            className='flex flex-1 items-center justify-center gap-1 rounded px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Download className='h-4 w-4' />
            {downloading ? 'Downloading...' : 'Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
