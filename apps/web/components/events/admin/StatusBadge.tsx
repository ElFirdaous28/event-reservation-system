import { EventStatus } from '@repo/shared';

export default function StatusBadge({ status }: { status: EventStatus }) {
  const styles: Record<EventStatus, string> = {
    [EventStatus.DRAFT]: 'bg-muted/30 text-foreground',
    [EventStatus.PUBLISHED]: 'bg-success/10 text-success border border-success/30',
    [EventStatus.CANCELED]: 'bg-error/10 text-error border border-error/30',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
