import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Event, EventStatus, Role } from '@repo/shared';
import { ReservationButton } from './ReservationButton';
import * as reservationsApi from '@/lib/api/reservations';
import * as authProvider from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/api/reservations', () => ({
    reservationsApi: {
        create: jest.fn(),
    },
}));

jest.mock('@/providers/AuthProvider', () => ({
    useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/components/ui', () => ({
    ErrorAlert: ({ title, message, onDismiss }: { title: string; message: string; onDismiss?: () => void }) => (
        <div role="alert" onClick={onDismiss}>
            <h2>{title}</h2>
            <p>{message}</p>
        </div>
    ),
}));

describe('ReservationButton - Reservation Flow', () => {
    const mockEvent: Event & { _id?: string; availableSeats?: number; hasReservation?: boolean } = {
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
    };

    const mockPush = jest.fn();
    const mockUseRouter = useRouter as jest.Mock;
    const mockUseAuth = authProvider.useAuth as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({ push: mockPush });
    });

    describe('Unauthenticated User Flow', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: false,
                user: null,
            });
        });

        it('should display "Log in to Reserve" button when user is not authenticated', () => {
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Log in to Reserve/i });
            expect(button).toBeInTheDocument();
            expect(button).not.toBeDisabled();
        });

        it('should redirect to login when clicking reserve without authentication', async () => {
            const user = userEvent.setup();
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Log in to Reserve/i });
            await user.click(button);

            expect(mockPush).toHaveBeenCalledWith('/login');
        });

        it('should not call reservation API without authentication', async () => {
            const user = userEvent.setup();
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Log in to Reserve/i });
            await user.click(button);

            expect(reservationsApi.reservationsApi.create).not.toHaveBeenCalled();
        });
    });

    describe('Authenticated User - Successful Reservation', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                user: {
                    _id: 'participant1',
                    email: 'participant@example.com',
                    fullName: 'John Participant',
                    role: 'participant',
                },
            });
            (reservationsApi.reservationsApi.create as jest.Mock).mockResolvedValue({
                reservation: { _id: 'res1' },
            });
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should display "Reserve Spot" button when user is authenticated and event is available', () => {
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            expect(button).toBeInTheDocument();
            expect(button).not.toBeDisabled();
        });

        it('should display available seats count', () => {
            render(<ReservationButton event={mockEvent} />);

            expect(screen.getByText('150 spots remaining')).toBeInTheDocument();
        });

        it('should call reservation API with correct event ID on successful reservation', async () => {
            const user = userEvent.setup({ delay: null });
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(reservationsApi.reservationsApi.create).toHaveBeenCalledWith({
                    eventId: '1',
                });
            });
        });

        it('should show loading state during reservation process', async () => {
            const user = userEvent.setup({ delay: null });
            (reservationsApi.reservationsApi.create as jest.Mock).mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ reservation: { _id: 'res1' } }), 100))
            );

            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            expect(screen.getByRole('button', { name: /Processing/i })).toBeInTheDocument();
            expect(button).toBeDisabled();
        });

        it('should display success message after successful reservation', async () => {
            const user = userEvent.setup({ delay: null });
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/Reservation successful/i)).toBeInTheDocument();
            });
        });

        it('should display "Reserved!" button text after successful reservation', async () => {
            const user = userEvent.setup({ delay: null });
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Reserved!/i })).toBeInTheDocument();
            });
        });

        it('should call onSuccess callback after successful reservation', async () => {
            const user = userEvent.setup({ delay: null });
            const onSuccess = jest.fn();

            render(<ReservationButton event={mockEvent} onSuccess={onSuccess} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(onSuccess).toHaveBeenCalled();
            });
        });

        it('should redirect to my reservations after successful reservation', async () => {
            const user = userEvent.setup({ delay: null });
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(reservationsApi.reservationsApi.create).toHaveBeenCalled();
            });

            jest.runAllTimers();

            expect(mockPush).toHaveBeenCalledWith('/participant/my-reservations');
        });

        it('should disable button after successful reservation', async () => {
            const user = userEvent.setup({ delay: null });
            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Reserved!/i })).toBeDisabled();
            });
        });
    });

    describe('Authenticated User - Error Scenarios', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                user: {
                    _id: 'participant1',
                    email: 'participant@example.com',
                    fullName: 'John Participant',
                    role: 'participant',
                },
            });
        });

        it('should display error when user already has a reservation', async () => {
            const user = userEvent.setup({ delay: null });
            const error = {
                response: {
                    data: {
                        message: 'You already have an active reservation for this event',
                    },
                },
            };
            (reservationsApi.reservationsApi.create as jest.Mock).mockRejectedValueOnce(error);

            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/You already have a reservation for this event/i)).toBeInTheDocument();
            });
        });

        it('should display error when event is full', async () => {
            const user = userEvent.setup({ delay: null });
            const error = {
                response: {
                    data: {
                        message: 'Event is full',
                    },
                },
            };
            (reservationsApi.reservationsApi.create as jest.Mock).mockRejectedValueOnce(error);

            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/This event is now full/i)).toBeInTheDocument();
            });
        });

        it('should display error when event is unpublished or cancelled', async () => {
            const user = userEvent.setup({ delay: null });
            const error = {
                response: {
                    data: {
                        message: 'This event is unpublished or cancelled',
                    },
                },
            };
            (reservationsApi.reservationsApi.create as jest.Mock).mockRejectedValueOnce(error);

            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/This event is no longer available/i)).toBeInTheDocument();
            });
        });

        it('should display generic error message for other errors', async () => {
            const user = userEvent.setup({ delay: null });
            const error = {
                response: {
                    data: {
                        message: 'Server error',
                    },
                },
            };
            (reservationsApi.reservationsApi.create as jest.Mock).mockRejectedValueOnce(error);

            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/Server error/i)).toBeInTheDocument();
            });
        });

    });

    describe('Event Status Validation', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                user: {
                    _id: 'participant1',
                    email: 'participant@example.com',
                    fullName: 'John Participant',
                    role: 'participant',
                },
            });
        });

        it('should display "Not Available" when event is not published', () => {
            const unpublishedEvent = { ...mockEvent, status: EventStatus.DRAFT };
            render(<ReservationButton event={unpublishedEvent} />);

            const button = screen.getByRole('button', { name: /Not Available/i });
            expect(button).toBeDisabled();
        });

        it('should display "Event Full" when no seats available', () => {
            const fullEvent = { ...mockEvent, availableSeats: 0 };
            render(<ReservationButton event={fullEvent} />);

            const button = screen.getByRole('button', { name: /Event Full/i });
            expect(button).toBeDisabled();
            expect(screen.getByText('0 spots remaining')).toBeInTheDocument();
        });

        it('should display error when event ID is missing', async () => {
            const user = userEvent.setup({ delay: null });
            const eventWithoutId = { ...mockEvent, _id: undefined };

            render(<ReservationButton event={eventWithoutId} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/Invalid event/i)).toBeInTheDocument();
            });
        });
    });

    describe('Available Seats Display', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                user: { _id: 'p1', email: 'p@example.com', fullName: 'P', role: 'participant' },
            });
        });

        it('should display singular "spot" when only 1 spot available', () => {
            const eventWithOneSpot = { ...mockEvent, availableSeats: 1 };
            render(<ReservationButton event={eventWithOneSpot} />);

            expect(screen.getByText('1 spot remaining')).toBeInTheDocument();
        });

        it('should display plural "spots" when multiple spots available', () => {
            render(<ReservationButton event={mockEvent} />);

            expect(screen.getByText('150 spots remaining')).toBeInTheDocument();
        });

        it('should display capacity when availableSeats is not defined', () => {
            const eventWithoutAvailable = { ...mockEvent, availableSeats: undefined };
            render(<ReservationButton event={eventWithoutAvailable} />);

            expect(screen.getByText('500 spots remaining')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                isAuthenticated: true,
                user: { _id: 'p1', email: 'p@example.com', fullName: 'P', role: 'participant' },
            });
        });

        it('should handle network error', async () => {
            const user = userEvent.setup({ delay: null });
            (reservationsApi.reservationsApi.create as jest.Mock).mockRejectedValueOnce(
                new Error('Network error')
            );

            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/Network error/i)).toBeInTheDocument();
            });
        });

        it('should handle error without response data', async () => {
            const user = userEvent.setup({ delay: null });
            (reservationsApi.reservationsApi.create as jest.Mock).mockRejectedValueOnce(
                new Error('Unknown error')
            );

            render(<ReservationButton event={mockEvent} />);

            const button = screen.getByRole('button', { name: /Reserve Spot/i });
            await user.click(button);

            await waitFor(() => {
                expect(screen.getByText(/Unknown error/i)).toBeInTheDocument();
            });
        });
    });
});
