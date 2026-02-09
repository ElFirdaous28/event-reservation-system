import React from 'react';
import { render, screen } from '@testing-library/react';
import { Event, EventStatus, Role } from '@repo/shared';
import { EventCard } from './EventCard';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock date-fns to have consistent dates in tests
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'EEEE, MMMM d, yyyy') {
      return 'Monday, January 15, 2024';
    }
    return date.toString();
  },
}));

describe('EventCard', () => {
  const mockEvent: Event & { _id?: string; availableSeats?: number } = {
    _id: '1',
    title: 'Tech Conference 2024',
    description: 'A comprehensive technology conference featuring industry experts',
    date: new Date('2024-01-15'),
    location: 'San Francisco, CA',
    capacity: 500,
    availableSeats: 150,
    status: EventStatus.PUBLISHED,
    createdBy: {
      _id: 'user1',
      email: 'creator@example.com',
      fullName: 'John Organizer',
      role: Role.ADMIN,
    },
  };

  describe('Rendering', () => {
    it('should render event card with all required information', () => {
      render(<EventCard event={mockEvent} />);

      expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      expect(
        screen.getByText('A comprehensive technology conference featuring industry experts'),
      ).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
    });

    it('should render event card without description when not provided', () => {
      const eventWithoutDescription = { ...mockEvent, description: '' };
      render(<EventCard event={eventWithoutDescription} />);

      expect(screen.getByText('No description available')).toBeInTheDocument();
    });

    it('should render event title as heading', () => {
      render(<EventCard event={mockEvent} />);

      const heading = screen.getByRole('heading', {
        level: 2,
        name: /Tech Conference 2024/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('should display event capacity information', () => {
      render(<EventCard event={mockEvent} />);

      expect(screen.getByText('150 spots available')).toBeInTheDocument();
    });

    it('should display capacity when availableSeats is not provided', () => {
      const eventWithoutAvailable = { ...mockEvent, availableSeats: undefined };
      render(<EventCard event={eventWithoutAvailable} />);

      expect(screen.getByText('500 spots available')).toBeInTheDocument();
    });
  });

  describe('Event Details Display', () => {
    it('should display event date in formatted manner', () => {
      render(<EventCard event={mockEvent} />);

      expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
    });

    it('should display event location', () => {
      render(<EventCard event={mockEvent} />);

      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    });

    it('should display available seats count', () => {
      render(<EventCard event={mockEvent} />);

      expect(screen.getByText('150 spots available')).toBeInTheDocument();
    });

    it('should truncate long descriptions', () => {
      const longDescription = 'A'.repeat(200);
      const eventWithLongDesc = { ...mockEvent, description: longDescription };
      const { container } = render(<EventCard event={eventWithLongDesc} />);

      const descriptionElement = container.querySelector('.line-clamp-3');
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement?.className).toContain('line-clamp-3');
    });
  });

  describe('Navigation Link', () => {
    it('should render link to event details when event has ID', () => {
      render(<EventCard event={mockEvent} />);

      const link = screen.getByRole('link', { name: /View Details/i });
      expect(link).toHaveAttribute('href', '/events/1');
    });

    it('should render disabled button when event has no ID', () => {
      const eventWithoutId = { ...mockEvent, _id: undefined };
      render(<EventCard event={eventWithoutId} />);

      const button = screen.getByRole('button', { name: /View Details/i });
      expect(button).toBeDisabled();
    });

    it('should have proper styling on View Details link', () => {
      render(<EventCard event={mockEvent} />);

      const link = screen.getByRole('link', { name: /View Details/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/events/1');
    });
  });

  describe('Styling', () => {
    it('should have card container classes', () => {
      const { container } = render(<EventCard event={mockEvent} />);

      const card = container.querySelector('.bg-surface');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should display with hover effect classes', () => {
      const { container } = render(<EventCard event={mockEvent} />);

      const card = container.querySelector('.bg-surface');
      expect(card?.className).toContain('hover:shadow-md');
    });
  });

  describe('Multiple Event Cards', () => {
    it('should render multiple event cards correctly', () => {
      const events = [
        mockEvent,
        {
          ...mockEvent,
          _id: '2',
          title: 'Frontend Meetup',
          availableSeats: 50,
        },
        {
          ...mockEvent,
          _id: '3',
          title: 'Backend Workshop',
          availableSeats: 100,
        },
      ];

      const { container } = render(
        <>
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </>,
      );

      expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      expect(screen.getByText('Frontend Meetup')).toBeInTheDocument();
      expect(screen.getByText('Backend Workshop')).toBeInTheDocument();

      const cards = container.querySelectorAll('.bg-surface');
      expect(cards).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle event with zero available seats', () => {
      const soldOutEvent = { ...mockEvent, availableSeats: 0 };
      render(<EventCard event={soldOutEvent} />);

      expect(screen.getByText('0 spots available')).toBeInTheDocument();
    });

    it('should handle event with very long title', () => {
      const longTitle = 'A'.repeat(100);
      const eventWithLongTitle = { ...mockEvent, title: longTitle };
      render(<EventCard event={eventWithLongTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle event with special characters in title', () => {
      const specialTitle = 'Tech & Design Conference 2024 (Virtual)';
      const eventWithSpecialTitle = { ...mockEvent, title: specialTitle };
      render(<EventCard event={eventWithSpecialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('should handle event with empty location', () => {
      const eventWithoutLocation = { ...mockEvent, location: '' };
      render(<EventCard event={eventWithoutLocation} />);

      // Should still render the card
      expect(screen.getByText(/Tech Conference 2024/i)).toBeInTheDocument();
      // Empty location won't be displayed, but that's expected
      expect(screen.queryByText('San Francisco, CA')).not.toBeInTheDocument();
    });
  });
});
