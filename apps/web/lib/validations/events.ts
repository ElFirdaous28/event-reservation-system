import { z } from 'zod';

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),
    description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
    date: z.string().refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, 'Event date must be today or in the future'),
    location: z
      .string()
      .min(3, 'Location must be at least 3 characters')
      .max(100, 'Location must be at most 100 characters'),
    capacity: z
      .number()
      .int('Capacity must be a whole number')
      .min(1, 'Capacity must be at least 1')
      .max(10000, 'Capacity must be at most 10,000'),
    availableSeats: z
      .number()
      .int('Available seats must be a whole number')
      .min(0, 'Available seats cannot be negative')
      .max(10000, 'Available seats must be at most 10,000')
      .optional(),
  })
  .refine(
    (data) => {
      // If availableSeats is provided, it cannot exceed capacity
      if (data.availableSeats !== undefined && data.availableSeats > data.capacity) {
        return false;
      }
      return true;
    },
    {
      message: 'Available seats cannot exceed capacity',
      path: ['availableSeats'],
    },
  );

export type CreateEventFormData = z.infer<typeof createEventSchema>;
