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

export function AdminReservationCard({
  reservation,
  onUpdate,
}: AdminReservationCardProps) {
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
      console.error('Error updating reservation:', err);
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
      console.error('Error downloading ticket:', err);
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
    <div className="bg-surface border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Status Header */}
      <div
        style={{ backgroundColor: `var(--${statusInfo.textColor.split('-')[1]})10` }}
        className="px-6 py-4 border-b border-border flex items-center justify-between"
      >
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {reservation.event.title}
          </h3>
          <p className="text-sm text-muted mt-1">
            User: {reservation.user.fullName} ({reservation.user.email})
          </p>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full text-white ${statusInfo.badgeBg}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted font-medium">Event Date</p>
            <p className="text-sm text-foreground font-semibold">
              {format(new Date(reservation.event.date), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Reserved On</p>
            <p className="text-sm text-foreground font-semibold">
              {format(new Date(reservation.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Location</p>
            <p className="text-sm text-foreground">{reservation.event.location}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-medium">User Email</p>
            <p className="text-sm text-foreground">{reservation.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Capacity</p>
            <p className="text-sm text-foreground">{reservation.event.capacity} spots</p>
          </div>
          <div>
            <p className="text-xs text-muted font-medium">Available</p>
            <p className="text-sm text-foreground">{typeof (reservation.event as any).availableSeats === 'number' ? `${(reservation.event as any).availableSeats} spots` : `${reservation.event.capacity} spots`}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
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
                  className="flex-1 px-3 py-2 rounded font-medium text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
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
                  className="flex-1 px-3 py-2 rounded font-medium text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
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
            className="flex-1 px-3 py-2 rounded font-medium text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-1"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
