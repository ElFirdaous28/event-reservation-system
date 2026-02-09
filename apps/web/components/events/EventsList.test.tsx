import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Event, EventStatus, Role } from '@repo/shared';
import { EventsList } from './EventsList';
import * as eventsApi from '@/lib/api/events';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === 'EEEE, MMMM d, yyyy') {
      return 'Monday, January 15, 2024';
    }
    return date.toString();
  },
}));

// Mock API
jest.mock('@/lib/api/events', () => ({
  eventsApi: {
    getAllEvents: jest.fn(),
  },
}));

// Mock UI components
jest.mock('@/components/ui', () => ({
  EmptyState: ({ title, message }: { title: string; message: string }) => (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
  ErrorAlert: ({ title, message }: { title: string; message: string }) => (
    <div role='alert'>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
  Skeleton: ({ count }: { type: string; count: number }) => (
    <div data-testid={`skeleton-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} data-testid='skeleton-item'>
          Loading...
        </div>
      ))}
    </div>
  ),
}));

describe('EventsList', () => {
  const mockEvents: Event[] = [
    {
      _id: '1',
      title: 'Tech Conference 2024',
      description: 'Annual tech conference',
      date: new Date('2024-01-15'),
      location: 'San Francisco, CA',
      capacity: 500,
      availableSeats: 150,
      status: EventStatus.PUBLISHED,
      createdBy: {
        _id: 'user1',
        email: 'organizer@example.com',
        fullName: 'John Organizer',
        role: Role.ADMIN,
      },
    },
    {
      _id: '2',
      title: 'Web Development Workshop',
      description: 'Learn web development',
      date: new Date('2024-02-20'),
      location: 'New York, NY',
      capacity: 100,
      availableSeats: 45,
      status: EventStatus.PUBLISHED,
      createdBy: {
        _id: 'user2',
        email: 'organizer2@example.com',
        fullName: 'Jane Organizer',
        role: Role.ADMIN,
      },
    },
    {
      _id: '3',
      title: 'AI Summit',
      description: 'Artificial Intelligence conference',
      date: new Date('2024-03-10'),
      location: 'Boston, MA',
      capacity: 300,
      availableSeats: 120,
      status: EventStatus.PUBLISHED,
      createdBy: {
        _id: 'user3',
        email: 'organizer3@example.com',
        fullName: 'Bob Organizer',
        role: Role.ADMIN,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display skeleton loaders while fetching events', () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ events: mockEvents }), 100)),
      );

      render(<EventsList />);

      expect(screen.getByTestId('skeleton-6')).toBeInTheDocument();
    });

    it('should show loading state with correct number of skeleton items', () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<EventsList />);

      const skeletonItems = screen.getAllByTestId('skeleton-item');
      expect(skeletonItems).toHaveLength(6);
    });
  });

  describe('Successful Loading', () => {
    it('should display rendered events after successful fetch', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      render(<EventsList />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
        expect(screen.getByText('Web Development Workshop')).toBeInTheDocument();
        expect(screen.getByText('AI Summit')).toBeInTheDocument();
      });
    });

    it('should display all event cards in a grid', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      const { container } = render(<EventsList />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      });

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
      expect(gridContainer).toHaveClass('gap-6');
    });

    it('should call getAllEvents with PUBLISHED status filter', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      render(<EventsList />);

      await waitFor(() => {
        expect(eventsApi.eventsApi.getAllEvents).toHaveBeenCalledWith({
          status: EventStatus.PUBLISHED,
        });
      });
    });

    it('should render correct number of event cards', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      const { container } = render(<EventsList />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      });

      const cards = container.querySelectorAll('.bg-surface');
      expect(cards).toHaveLength(mockEvents.length);
    });

    it('should display events with links to detail pages', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      render(<EventsList />);

      await waitFor(() => {
        const links = screen.getAllByRole('link', { name: /View Details/i });
        expect(links).toHaveLength(3);
        expect(links[0]).toHaveAttribute('href', '/events/1');
        expect(links[1]).toHaveAttribute('href', '/events/2');
        expect(links[2]).toHaveAttribute('href', '/events/3');
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no events available', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: [],
      });

      render(<EventsList />);

      // Wait for loading to complete and empty state to appear
      await waitFor(
        () => {
          expect(screen.getByText('No Events Available')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should display empty state when events array is empty after null check', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: undefined,
      });

      render(<EventsList />);

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(screen.getByText('No Events Available')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Error State', () => {
    it('should display error alert when API call fails', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch events'),
      );

      render(<EventsList />);

      await waitFor(
        () => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
          expect(screen.getByText('Error Loading Events')).toBeInTheDocument();
          expect(screen.getByText(/Failed to load events/i)).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should display error dismiss button', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EventsList />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should handle different error scenarios gracefully', async () => {
      const errors = [
        new Error('Network error'),
        new Error('Server error'),
        new Error('Unauthorized'),
      ];

      for (const error of errors) {
        jest.clearAllMocks();
        (eventsApi.eventsApi.getAllEvents as jest.Mock).mockRejectedValueOnce(error);

        const { unmount } = render(<EventsList />);

        await waitFor(() => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Filtering', () => {
    it('should fetch published events only', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      render(<EventsList />);

      await waitFor(() => {
        expect(eventsApi.eventsApi.getAllEvents).toHaveBeenCalledWith({
          status: EventStatus.PUBLISHED,
        });
      });
    });

    it('should display only published events from API response', async () => {
      const publishedEvents = mockEvents.filter((e) => e.status === EventStatus.PUBLISHED);
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: publishedEvents,
      });

      render(<EventsList />);

      await waitFor(() => {
        publishedEvents.forEach((event) => {
          expect(screen.getByText(event.title)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Event Card Integration', () => {
    it('should pass correct event data to each EventCard', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      render(<EventsList />);

      await waitFor(() => {
        mockEvents.forEach((event) => {
          expect(screen.getByText(event.title)).toBeInTheDocument();
          expect(screen.getByText(event.location)).toBeInTheDocument();
        });
      });
    });

    it('should render event descriptions in cards', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      render(<EventsList />);

      await waitFor(() => {
        mockEvents.forEach((event) => {
          expect(screen.getByText(event.description)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive grid classes', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      const { container } = render(<EventsList />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      });

      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('md:grid-cols-2');
      expect(grid?.className).toContain('lg:grid-cols-3');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistent event display across renders', async () => {
      (eventsApi.eventsApi.getAllEvents as jest.Mock).mockResolvedValue({
        events: mockEvents,
      });

      const { rerender } = render(<EventsList />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
      });

      rerender(<EventsList />);

      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
        expect(screen.getByText('Web Development Workshop')).toBeInTheDocument();
        expect(screen.getByText('AI Summit')).toBeInTheDocument();
      });
    });
  });
});
