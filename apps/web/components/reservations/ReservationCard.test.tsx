import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationStatus, SafeReservation, Event, EventStatus, Role } from '@repo/shared';
import { ReservationCard } from './ReservationCard';
import * as reservationsApi from '@/lib/api/reservations';

// Mock dependencies
jest.mock('@/lib/api/reservations', () => ({
    reservationsApi: {
        changeStatus: jest.fn(),
        downloadTicket: jest.fn(),
    },
}));

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
});

jest.mock('date-fns', () => ({
    format: (date: Date, formatStr: string) => {
        if (formatStr === 'EEEE, MMMM d, yyyy') {
            return 'Monday, January 15, 2024';
        }
        if (formatStr === 'MMM d, yyyy') {
            return 'Jan 10, 2024';
        }
        return date.toString();
    },
}));

jest.mock('lucide-react', () => ({
    Download: () => <span data-testid="download-icon">Download Icon</span>,
}));

describe('ReservationCard', () => {
    const mockEvent: Event & { _id?: string; availableSeats?: number } = {
        _id: 'event-1',
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
            role: Role.PARTICIPANT,
        },
    };

    const mockReservation: SafeReservation = {
        _id: 'res-1',
        user: {
            _id: 'user2',
            email: 'participant@example.com',
            fullName: 'John Participant',
            role: Role.PARTICIPANT,
        },
        event: mockEvent,
        status: ReservationStatus.CONFIRMED,
        createdAt: new Date('2024-01-10'),
    };

    const mockOnUpdate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
        // Mock URL methods
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    describe('Rendering', () => {
        it('should render event title and details', () => {
            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
            expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
            expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
        });

        it('should display available seats when provided', () => {
            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByText('150/500 spots available')).toBeInTheDocument();
        });

        it('should display only capacity when availableSeats is not provided', () => {
            const eventWithoutSeats = { ...mockEvent, availableSeats: undefined };
            const reservation = { ...mockReservation, event: eventWithoutSeats };

            render(<ReservationCard reservation={reservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByText('500 spots')).toBeInTheDocument();
        });

        it('should display reservation created date', () => {
            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByText(/Reserved on Jan 10, 2024/)).toBeInTheDocument();
        });

        it('should render all action buttons', () => {
            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByRole('button', { name: /Download Ticket/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /View Event/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Cancel Reservation/i })).toBeInTheDocument();
        });

        it('should have correct link to participant events page', () => {
            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const link = screen.getByRole('link', { name: /View Event/i });
            expect(link).toHaveAttribute('href', '/participant/events');
        });
    });

    describe('Status Display', () => {
        it.each([
            [ReservationStatus.PENDING, 'Pending'],
            [ReservationStatus.CONFIRMED, 'Confirmed'],
            [ReservationStatus.REFUSED, 'Refused'],
            [ReservationStatus.CANCELED, 'Canceled'],
        ])('should display correct badge for %s status', (status, expectedLabel) => {
            const reservation = { ...mockReservation, status };
            render(<ReservationCard reservation={reservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByText(expectedLabel)).toBeInTheDocument();
        });
    });

    describe('Cancel Button Visibility', () => {
        it('should show cancel button for PENDING reservations', () => {
            const reservation = { ...mockReservation, status: ReservationStatus.PENDING };
            render(<ReservationCard reservation={reservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByRole('button', { name: /Cancel Reservation/i })).toBeInTheDocument();
        });

        it('should show cancel button for CONFIRMED reservations', () => {
            const reservation = { ...mockReservation, status: ReservationStatus.CONFIRMED };
            render(<ReservationCard reservation={reservation} onUpdate={mockOnUpdate} />);

            expect(screen.getByRole('button', { name: /Cancel Reservation/i })).toBeInTheDocument();
        });

        it('should not show cancel button for REFUSED reservations', () => {
            const reservation = { ...mockReservation, status: ReservationStatus.REFUSED };
            render(<ReservationCard reservation={reservation} onUpdate={mockOnUpdate} />);

            expect(screen.queryByRole('button', { name: /Cancel Reservation/i })).not.toBeInTheDocument();
        });

        it('should not show cancel button for CANCELED reservations', () => {
            const reservation = { ...mockReservation, status: ReservationStatus.CANCELED };
            render(<ReservationCard reservation={reservation} onUpdate={mockOnUpdate} />);

            expect(screen.queryByRole('button', { name: /Cancel Reservation/i })).not.toBeInTheDocument();
        });
    });

    describe('Cancel Reservation Flow', () => {
        it('should show confirmation dialog when cancel is clicked', async () => {
            const user = userEvent.setup();
            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this reservation?');
        });

        it('should not proceed if user denies confirmation', async () => {
            const user = userEvent.setup();
            (window.confirm as jest.Mock).mockReturnValue(false);

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            expect(reservationsApi.reservationsApi.changeStatus).not.toHaveBeenCalled();
        });

        it('should call API with correct parameters when confirmed', async () => {
            const user = userEvent.setup();
            (reservationsApi.reservationsApi.changeStatus as jest.Mock).mockResolvedValue({});

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            await waitFor(() => {
                expect(reservationsApi.reservationsApi.changeStatus).toHaveBeenCalledWith('res-1', {
                    status: ReservationStatus.CANCELED,
                });
            });
        });

        it('should show loading state during cancellation', async () => {
            const user = userEvent.setup();
            let resolveCancel: (value: any) => void;
            const cancelPromise = new Promise((resolve) => {
                resolveCancel = resolve;
            });
            (reservationsApi.reservationsApi.changeStatus as jest.Mock).mockReturnValue(cancelPromise);

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            expect(screen.getByRole('button', { name: /Canceling/i })).toBeInTheDocument();
            expect(cancelButton).toBeDisabled();

            resolveCancel!({});
        });

        it('should call onUpdate after successful cancellation', async () => {
            const user = userEvent.setup();
            (reservationsApi.reservationsApi.changeStatus as jest.Mock).mockResolvedValue({});

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            await waitFor(() => {
                expect(mockOnUpdate).toHaveBeenCalled();
            });
        });

        it('should display error message when cancellation fails', async () => {
            const user = userEvent.setup();
            const error = {
                response: {
                    data: {
                        message: 'Cannot cancel reservation',
                    },
                },
            };
            (reservationsApi.reservationsApi.changeStatus as jest.Mock).mockRejectedValue(error);

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByText('Cannot cancel reservation')).toBeInTheDocument();
            });
        });

        it('should display generic error when error has no message', async () => {
            const user = userEvent.setup();
            (reservationsApi.reservationsApi.changeStatus as jest.Mock).mockRejectedValue(new Error());

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to cancel reservation')).toBeInTheDocument();
            });
        });

        it('should not call onUpdate when cancellation fails', async () => {
            const user = userEvent.setup();
            const error = { response: { data: { message: 'Error' } } };
            (reservationsApi.reservationsApi.changeStatus as jest.Mock).mockRejectedValue(error);

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const cancelButton = screen.getByRole('button', { name: /Cancel Reservation/i });
            await user.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByText('Error')).toBeInTheDocument();
            });

            expect(mockOnUpdate).not.toHaveBeenCalled();
        });
    });

    describe('Download Ticket Flow', () => {
        it('should call downloadTicket API when clicked', async () => {
            const user = userEvent.setup();
            const mockBlob = new Blob(['test pdf'], { type: 'application/pdf' });
            (reservationsApi.reservationsApi.downloadTicket as jest.Mock).mockResolvedValue(mockBlob);

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const downloadButton = screen.getByRole('button', { name: /Download Ticket/i });
            await user.click(downloadButton);

            await waitFor(() => {
                expect(reservationsApi.reservationsApi.downloadTicket).toHaveBeenCalledWith('res-1');
            });
        });

        it('should show loading state during download', async () => {
            const user = userEvent.setup();
            let resolveDownload: (value: any) => void;
            const downloadPromise = new Promise((resolve) => {
                resolveDownload = resolve;
            });
            (reservationsApi.reservationsApi.downloadTicket as jest.Mock).mockReturnValue(downloadPromise);

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const downloadButton = screen.getByRole('button', { name: /Download Ticket/i });
            await user.click(downloadButton);

            expect(screen.getByRole('button', { name: /Downloading/i })).toBeInTheDocument();
            expect(downloadButton).toBeDisabled();

            resolveDownload!(new Blob(['test'], { type: 'application/pdf' }));
        });

        it('should display error message when download fails', async () => {
            const user = userEvent.setup();
            const error = {
                response: {
                    data: {
                        message: 'Download failed',
                    },
                },
            };
            (reservationsApi.reservationsApi.downloadTicket as jest.Mock).mockRejectedValue(error);

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const downloadButton = screen.getByRole('button', { name: /Download Ticket/i });
            await user.click(downloadButton);

            await waitFor(() => {
                expect(screen.getByText('Download failed')).toBeInTheDocument();
            });
        });

        it('should display generic error when download error has no message', async () => {
            const user = userEvent.setup();
            (reservationsApi.reservationsApi.downloadTicket as jest.Mock).mockRejectedValue(new Error());

            render(<ReservationCard reservation={mockReservation} onUpdate={mockOnUpdate} />);

            const downloadButton = screen.getByRole('button', { name: /Download Ticket/i });
            await user.click(downloadButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to download ticket')).toBeInTheDocument();
            });
        });
    });
});
