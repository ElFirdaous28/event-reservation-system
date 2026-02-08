'use client';

import { useEffect, useState } from 'react';
import { CreateEventDto } from '@repo/shared';
import { createEventSchema } from '@/lib/validations/events';
import { ZodError } from 'zod';

export type EventFormValues = CreateEventDto;

type FieldErrors = Partial<Record<keyof EventFormValues, string>>;

export default function EventForm({
  initialValues,
  onSubmit,
  submitLabel,
  loading = false,
}: {
  initialValues: EventFormValues;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  submitLabel: string;
  loading?: boolean;
}) {
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [date, setDate] = useState(initialValues.date ?? '');
  const [location, setLocation] = useState(initialValues.location ?? '');
  const [capacity, setCapacity] = useState(String(initialValues.capacity ?? 1));
  const [availableSeats, setAvailableSeats] = useState(String((initialValues as any).availableSeats ?? initialValues.capacity ?? 1));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialValues.title ?? '');
    setDescription(initialValues.description ?? '');
    setDate(initialValues.date ?? '');
    setLocation(initialValues.location ?? '');
    setCapacity(String(initialValues.capacity ?? 1));
    setAvailableSeats(String((initialValues as any).availableSeats ?? initialValues.capacity ?? 1));
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const payload: EventFormValues = {
      title: title.trim(),
      description: description?.trim() || undefined,
      date,
      location: location.trim(),
      capacity: Number(capacity),
      availableSeats: Number(availableSeats),
    };

    // Validate with Zod
    try {
      createEventSchema.parse(payload);
      await onSubmit(payload);
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: FieldErrors = {};
        error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof EventFormValues;
          if (path) {
            fieldErrors[path] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError('An error occurred while validating the form');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          {generalError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-muted">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 block w-full border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 ${errors.title ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
            }`}
        />
        {errors.title && <p className="mt-1 text-sm text-error">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`mt-1 block w-full border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 ${errors.description ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
            }`}
        />
        {errors.description && <p className="mt-1 text-sm text-error">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-muted">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`mt-1 block w-full border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 ${errors.date ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
          />
          {errors.date && <p className="mt-1 text-sm text-error">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted">Capacity</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => { setCapacity(e.target.value); setAvailableSeats(e.target.value) }}
            className={`mt-1 block w-full border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 ${errors.capacity ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
          />
          {errors.capacity && <p className="mt-1 text-sm text-error">{errors.capacity}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted">Available Seats</label>
          <input
            type="number"
            value={availableSeats}
            onChange={(e) => setAvailableSeats(e.target.value)}
            className={`mt-1 block w-full border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 ${errors.availableSeats ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
              }`}
          />
          {errors.availableSeats && <p className="mt-1 text-sm text-error">{errors.availableSeats}</p>}
          <p className="mt-1 text-xs text-muted">Set lower than capacity to reserve VIP seats</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`mt-1 block w-full border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 ${errors.location ? 'border-error focus:ring-error' : 'border-border focus:ring-primary'
            }`}
        />
        {errors.location && <p className="mt-1 text-sm text-error">{errors.location}</p>}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
