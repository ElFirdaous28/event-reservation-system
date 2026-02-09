import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

type SkeletonType =
  | 'generic'
  | 'event-card'
  | 'event-details'
  | 'reservation'
  | 'table-row'
  | 'profile';

interface SkeletonVariantProps {
  type: SkeletonType;
  count?: number;
  columns?: number; // for table-row
}

/**
 * Generic Skeleton - simple animated block
 */
const GenericSkeleton: React.FC<SkeletonProps> = ({ className = 'h-12 w-full', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${className} animate-pulse rounded`}
          style={{ backgroundColor: 'var(--border)' }}
        />
      ))}
    </>
  );
};

/**
 * Event Card Skeleton - matches EventCard layout
 */
const EventCardVariant: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='bg-surface border-border space-y-4 rounded-lg border p-6 shadow-sm'>
          <GenericSkeleton className='h-6 w-3/4' count={1} />
          <GenericSkeleton className='h-4 w-full' count={1} />
          <GenericSkeleton className='h-4 w-5/6' count={1} />
          <div className='space-y-2'>
            <GenericSkeleton className='h-4 w-full' count={1} />
            <GenericSkeleton className='h-4 w-full' count={1} />
            <GenericSkeleton className='h-4 w-3/4' count={1} />
          </div>
          <GenericSkeleton className='h-10 w-full' count={1} />
        </div>
      ))}
    </>
  );
};

/**
 * Event Details Skeleton - matches EventDetails layout
 */
const EventDetailsVariant: React.FC = () => {
  return (
    <div className='bg-surface border-border space-y-6 rounded-lg border p-6 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 space-y-2'>
          <GenericSkeleton className='h-8 w-3/4' count={1} />
          <GenericSkeleton className='h-4 w-1/2' count={1} />
        </div>
        <GenericSkeleton className='h-6 w-20' count={1} />
      </div>

      <GenericSkeleton className='h-24 w-full' count={1} />

      <div className='space-y-3'>
        <GenericSkeleton className='h-5 w-full' count={1} />
        <GenericSkeleton className='h-5 w-full' count={1} />
        <GenericSkeleton className='h-5 w-3/4' count={1} />
      </div>
    </div>
  );
};

/**
 * Reservation Skeleton - for lists
 */
const ReservationVariant: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='bg-surface border-border space-y-3 rounded-lg border p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            <GenericSkeleton className='h-5 w-2/3' count={1} />
            <GenericSkeleton className='h-5 w-20' count={1} />
          </div>
          <GenericSkeleton className='h-4 w-full' count={1} />
          <div className='flex gap-2'>
            <GenericSkeleton className='h-4 w-24' count={1} />
            <GenericSkeleton className='h-4 w-24' count={1} />
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * Table Row Skeleton - for data tables
 */
const TableRowVariant: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className='px-4 py-3'>
          <GenericSkeleton className='h-4 w-full' count={1} />
        </td>
      ))}
    </tr>
  );
};

/**
 * Profile Skeleton - for user profile pages
 */
const ProfileVariant: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <GenericSkeleton className='h-16 w-16 rounded-full' count={1} />
        <div className='flex-1 space-y-2'>
          <GenericSkeleton className='h-6 w-1/3' count={1} />
          <GenericSkeleton className='h-4 w-1/2' count={1} />
        </div>
      </div>

      <div className='bg-surface border-border space-y-3 rounded-lg border p-4'>
        <GenericSkeleton className='h-5 w-1/4' count={1} />
        <GenericSkeleton className='h-4 w-full' count={1} />
        <GenericSkeleton className='h-4 w-3/4' count={1} />
      </div>
    </div>
  );
};

/**
 * Skeleton Component - Polymorphic component that renders different skeleton types
 *
 * @param type - Skeleton type: 'generic' | 'event-card' | 'event-details' | 'reservation' | 'table-row' | 'profile'
 * @param count - Number of items (for generic, event-card, reservation)
 * @param columns - Number of columns (for table-row)
 *
 * @example
 * <Skeleton type="event-card" count={3} />
 * <Skeleton type="event-details" />
 * <Skeleton type="reservation" count={5} />
 */
export const Skeleton: React.FC<SkeletonVariantProps> = ({
  type = 'generic',
  count = 1,
  columns = 4,
}) => {
  switch (type) {
    case 'event-card':
      return <EventCardVariant count={count} />;
    case 'event-details':
      return <EventDetailsVariant />;
    case 'reservation':
      return <ReservationVariant count={count} />;
    case 'table-row':
      return <TableRowVariant columns={columns} />;
    case 'profile':
      return <ProfileVariant />;
    case 'generic':
    default:
      return <GenericSkeleton className='h-12 w-full' count={count} />;
  }
};
