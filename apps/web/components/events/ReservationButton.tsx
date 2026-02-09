'use client';

import { useState } from 'react';
import { reservationsApi } from '@/lib/api/reservations';
import { EventStatus, Event } from '@repo/shared';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { ErrorAlert } from '@/components/ui';

type ReservationButtonProps = {
  event: Event & { availableSeats?: number; hasReservation?: boolean };
  onSuccess?: () => void;
};

export function ReservationButton({ event, onSuccess }: ReservationButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isFull = typeof event.availableSeats === 'number' ? event.availableSeats <= 0 : false;
  const isNotPublished = event.status !== EventStatus.PUBLISHED;

  // Frontend validation
  const canReserve = () => {
    if (!isAuthenticated) {
      setError('Please log in to make a reservation');
      return false;
    }

    if (isNotPublished) {
      setError('This event is not available for reservations');
      return false;
    }

    if (isFull) {
      setError('This event is full');
      return false;
    }

    if (!event._id) {
      setError('Invalid event');
      return false;
    }

    return true;
  };

  const handleReservation = async () => {
    setError(null);
    setSuccess(false);

    if (!canReserve()) {
      return;
    }

    try {
      setLoading(true);
      await reservationsApi.create({ eventId: event._id });
      setSuccess(true);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Redirect to my bookings after a short delay
      setTimeout(() => {
        router.push('/participant/my-reservations');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating reservation:', err);

      // Handle backend errors
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to create reservation';

      if (errorMessage.includes('already have an active reservation')) {
        setError('You already have a reservation for this event');
      } else if (errorMessage.includes('Event is full')) {
        setError('This event is now full');
      } else if (errorMessage.includes('unpublished or cancelled')) {
        setError('This event is no longer available');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    handleReservation();
  };

  return (
    <div className='mt-6'>
      {error && (
        <ErrorAlert
          title='Reservation Error'
          message={error}
          onDismiss={() => setError(null)}
          className='mb-4'
        />
      )}

      {success && (
        <div className='mb-4 rounded-lg border border-green-200 bg-green-50 p-4'>
          <p className='font-medium text-green-800'>
            ✓ Reservation successful! Redirecting to your bookings...
          </p>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={loading || success || (isAuthenticated && (isFull || isNotPublished))}
        className={`w-full rounded-lg px-6 py-3 font-medium transition-colors ${
          loading || success || (isAuthenticated && (isFull || isNotPublished))
            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
            : 'bg-primary hover:bg-primary-hover text-white'
        }`}
      >
        {loading
          ? 'Processing...'
          : success
            ? 'Reserved!'
            : !isAuthenticated
              ? 'Log in to Reserve'
              : isFull
                ? 'Event Full'
                : isNotPublished
                  ? 'Not Available'
                  : 'Reserve Spot'}
      </button>

      <p className='text-muted mt-2 text-center text-sm'>
        {typeof event.availableSeats === 'number'
          ? `${event.availableSeats} spot${event.availableSeats !== 1 ? 's' : ''} remaining`
          : `${event.capacity} spots remaining`}
      </p>
    </div>
  );
}
