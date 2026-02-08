'use client';

import { useEffect, useState } from 'react';
import { CreateEventDto } from '@repo/shared';

export type EventFormValues = CreateEventDto;

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

  useEffect(() => {
    setTitle(initialValues.title ?? '');
    setDescription(initialValues.description ?? '');
    setDate(initialValues.date ?? '');
    setLocation(initialValues.location ?? '');
    setCapacity(String(initialValues.capacity ?? 1));
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: EventFormValues = {
      title: title.trim(),
      description: description?.trim() || undefined,
      date,
      location: location.trim(),
      capacity: Number(capacity),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-muted">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted">Capacity</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="mt-1 block w-full border border-border rounded px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
