import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Event, EventStatus, Role } from '@repo/shared';
import { EventDetails } from './EventDetails';
import * as eventsApi from '@/lib/api/events';

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
        getOne: jest.fn(),
    },
}));

jest.mock('@/lib/api/reservations', () => ({
    reservationsApi: {
        create: jest.fn(),
    },
}));

// Mock UI components
jest.mock('@/components/ui', () => ({
    ErrorAlert: ({ title, message }: { title: string; message: string }) => (
        <div role="alert">
            <h2>{title}</h2>
            <p>{message}</p>
        </div>
    ),
    Skeleton: ({ type }: { type: string }) => (
        <div data-testid={`skeleton-${type}`}>Loading...</div>
    ),
}));

// Mock ReservationButton
jest.mock('./ReservationButton', () => ({
    ReservationButton: ({ event, onSuccess }: { event: any; onSuccess: any }) => (
        <button onClick={() => onSuccess()} data-testid="reservation-button">
            Reserve Now
        </button>
    ),
}));

describe('EventDetails', () => {
    const mockEvent: Event & { _id?: string; availableSeats?: number } = {
        _id: '1',
        title: 'Tech Conference 2024',
        description: 'A comprehensive technology conference featuring industry experts and keynote speakers',
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
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should display skeleton loader while fetching event', () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockImplementation(
                () => new Promise(() => { }) // Never resolves
            );

            render(<EventDetails id="1" />);

            expect(screen.getByTestId('skeleton-event-details')).toBeInTheDocument();
        });

        it('should display skeleton with correct type', () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockImplementation(
                () => new Promise(() => { })
            );

            render(<EventDetails id="1" />);

            expect(screen.getByTestId('skeleton-event-details')).toBeInTheDocument();
        });
    });

    describe('Successful Loading', () => {
        it('should display event details after successful fetch', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
                expect(
                    screen.getByText(
                        'A comprehensive technology conference featuring industry experts and keynote speakers'
                    )
                ).toBeInTheDocument();
            });
        });

        it('should fetch event with correct ID', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(eventsApi.eventsApi.getOne).toHaveBeenCalledWith('1');
            });
        });

        it('should display event title as main heading', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                const heading = screen.getByRole('heading', { level: 2, name: /Tech Conference 2024/i });
                expect(heading).toBeInTheDocument();
            });
        });

        it('should display formatted event date', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
            });
        });

        it('should display event status badge', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText(EventStatus.PUBLISHED)).toBeInTheDocument();
            });
        });

        it('should display event location', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
            });
        });

        it('should display total capacity', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('500 spots')).toBeInTheDocument();
            });
        });

        it('should display available seats when defined', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('150 spots')).toBeInTheDocument();
            });
        });

        it('should display available seats equal to capacity when not defined', async () => {
            const eventWithoutAvailable = { ...mockEvent, availableSeats: undefined };
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: eventWithoutAvailable,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                const availableElements = screen.getAllByText('500 spots');
                expect(availableElements.length).toBeGreaterThan(1); // One for total, one for available
            });
        });

        it('should render ReservationButton component', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByTestId('reservation-button')).toBeInTheDocument();
            });
        });
    });

    describe('Event Details Structure', () => {
        it('should display all detail rows', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
                expect(screen.getByText(/500 spots/)).toBeInTheDocument();
            });
        });

        it('should display event description', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'A comprehensive technology conference featuring industry experts and keynote speakers'
                    )
                ).toBeInTheDocument();
            });
        });

        it('should display default description when not provided', async () => {
            const eventWithoutDescription = { ...mockEvent, description: '' };
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: eventWithoutDescription,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('No description available.')).toBeInTheDocument();
            });
        });
    });

    describe('Error State', () => {
        it('should display error alert when API call fails', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockRejectedValue(
                new Error('Failed to fetch event')
            );

            render(<EventDetails id="1" />);

            await waitFor(
                () => {
                    expect(screen.getByRole('alert')).toBeInTheDocument();
                    expect(screen.getByText('Error Loading Event')).toBeInTheDocument();
                    expect(screen.getByText(/Failed to load event details/i)).toBeInTheDocument();
                },
                { timeout: 3000 }
            );
        });

        it('should display not found error when event is null', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue(null);

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText('Event Not Found')).toBeInTheDocument();
                expect(screen.getByText(/couldn't find the event/i)).toBeInTheDocument();
            });
        });

        it('should handle various error scenarios', async () => {
            const errors = [
                new Error('Network error'),
                new Error('Server error'),
                new Error('Unauthorized'),
            ];

            for (const error of errors) {
                jest.clearAllMocks();
                (eventsApi.eventsApi.getOne as jest.Mock).mockRejectedValueOnce(error);

                const { unmount } = render(<EventDetails id="1" />);

                await waitFor(() => {
                    expect(screen.getByRole('alert')).toBeInTheDocument();
                });

                unmount();
            }
        });
    });

    describe('API Integration', () => {
        it('should refetch event data when onSuccess is called from ReservationButton', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock)
                .mockResolvedValueOnce({ event: mockEvent })
                .mockResolvedValueOnce({ ...mockEvent, availableSeats: 149 });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('150 spots')).toBeInTheDocument();
            });

            const button = screen.getByTestId('reservation-button');
            button.click();

            await waitFor(() => {
                expect(eventsApi.eventsApi.getOne).toHaveBeenCalledTimes(2);
            });
        });

        it('should pass event data to ReservationButton', async () => {
            const mockEventData = {
                ...mockEvent,
                availableSeats: 100,
            };

            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEventData,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByTestId('reservation-button')).toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should not render when ID is empty string', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="" />);

            await waitFor(() => {
                expect(eventsApi.eventsApi.getOne).not.toHaveBeenCalled();
            });
        });

        it('should handle event with zero available seats', async () => {
            const soldOutEvent = { ...mockEvent, availableSeats: 0 };
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: soldOutEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('0 spots')).toBeInTheDocument();
            });
        });

        it('should handle event with very long title', async () => {
            const longTitle = 'A'.repeat(100);
            const eventWithLongTitle = { ...mockEvent, title: longTitle };

            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: eventWithLongTitle,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText(longTitle)).toBeInTheDocument();
            });
        });

        it('should handle event with special characters', async () => {
            const specialEvent = {
                ...mockEvent,
                title: 'Tech & Innovation Conference (2024) - Virtual/In-Person',
            };

            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: specialEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText(/Tech & Innovation Conference/i)).toBeInTheDocument();
            });
        });
    });

    describe('Styling & Layout', () => {
        it('should render with card container styling', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            const { container } = render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
            });

            const cardContainer = container.querySelector('.bg-surface');
            expect(cardContainer).toHaveClass('border');
            expect(cardContainer).toHaveClass('rounded-lg');
            expect(cardContainer).toHaveClass('p-6');
            expect(cardContainer).toHaveClass('shadow-sm');
        });

        it('should display status badge with proper styling', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            const { container } = render(<EventDetails id="1" />);

            await waitFor(() => {
                const statusBadge = container.querySelector('[class*="bg-primary"]');
                expect(statusBadge).toBeInTheDocument();
                expect(statusBadge?.textContent).toContain(EventStatus.PUBLISHED);
            });
        });
    });

    describe('Data Display', () => {
        it('should display all event information correctly', async () => {
            (eventsApi.eventsApi.getOne as jest.Mock).mockResolvedValue({
                event: mockEvent,
            });

            render(<EventDetails id="1" />);

            await waitFor(() => {
                expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
                expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
                expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
                expect(screen.getByText('500 spots')).toBeInTheDocument();
                expect(screen.getByText('150 spots')).toBeInTheDocument();
                expect(
                    screen.getByText(
                        'A comprehensive technology conference featuring industry experts and keynote speakers'
                    )
                ).toBeInTheDocument();
            });
        });
    });
});
