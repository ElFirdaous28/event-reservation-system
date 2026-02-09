'use client';

import { format } from 'date-fns';
import { ReservationStatus, SafeReservation } from '@repo/shared';
import { useState } from 'react';
import { reservationsApi } from '@/lib/api/reservations';
import Link from 'next/link';
import { Download } from 'lucide-react';

type ReservationCardProps = {
  reservation: SafeReservation;
  onUpdate: () => void;
};

const statusConfig = {
  [ReservationStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  [ReservationStatus.CONFIRMED]: {
    label: 'Confirmed',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  [ReservationStatus.REFUSED]: {
    label: 'Refused',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  [ReservationStatus.CANCELED]: {
    label: 'Canceled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
};

export function ReservationCard({ reservation, onUpdate }: ReservationCardProps) {
  const [canceling, setCanceling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCancel =
    reservation.status === ReservationStatus.PENDING ||
    reservation.status === ReservationStatus.CONFIRMED;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setCanceling(true);
      setError(null);
      await reservationsApi.changeStatus(reservation._id, {
        status: ReservationStatus.CANCELED,
      });
      onUpdate();
    } catch (err: any) {
      console.error('Error canceling reservation:', err);
      setError(err?.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCanceling(false);
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
      console.error('Error downloading ticket:', err);
      setError(err?.response?.data?.message || 'Failed to download ticket');
    } finally {
      setDownloading(false);
    }
  };

  const eventId = reservation.event._id;
  const statusInfo = statusConfig[reservation.status];

  return (
    <div className='bg-surface border-border rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md'>
      <div className='mb-4 flex items-start justify-between gap-4'>
        <div className='flex-1'>
          <h3 className='text-foreground mb-2 text-xl font-semibold'>{reservation.event.title}</h3>
          <div className='text-muted space-y-1 text-sm'>
            <div className='flex items-center gap-2'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              {format(new Date(reservation.event.date), 'EEEE, MMMM d, yyyy')}
            </div>
            <div className='flex items-center gap-2'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              {reservation.event.location}
            </div>
            <div className='flex items-center gap-2'>
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
              {typeof (reservation.event as any).availableSeats === 'number'
                ? `${(reservation.event as any).availableSeats}/${reservation.event.capacity} spots available`
                : `${reservation.event.capacity} spots`}
            </div>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase ${statusInfo.className}`}
        >
          {statusInfo.label}
        </span>
      </div>

      <div className='text-muted mb-4 text-xs'>
        Reserved on {format(new Date(reservation.createdAt), 'MMM d, yyyy')}
      </div>

      {error && (
        <div className='mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
          {error}
        </div>
      )}

      <div className='flex gap-3'>
        <button
          onClick={handleDownloadTicket}
          disabled={downloading}
          className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <Download className='h-4 w-4' />
          {downloading ? 'Downloading...' : 'Download Ticket'}
        </button>
        <Link
          href={`/participant/events`}
          className='border-border text-foreground flex-1 rounded-lg border px-4 py-2 text-center transition-colors hover:bg-gray-50'
        >
          View Event
        </Link>
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={canceling}
            className='flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {canceling ? 'Canceling...' : 'Cancel Reservation'}
          </button>
        )}
      </div>
    </div>
  );
}
