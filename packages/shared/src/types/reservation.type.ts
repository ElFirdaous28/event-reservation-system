import { ReservationStatus } from '../enums/reservation-status.enum';
import { User } from './user.type';
import { Event } from './event.type';

export type SafeReservation = {
    id: string;
    user: User;
    event: Event;
    status: ReservationStatus;
    createdAt: Date;
};

export interface CreateReservationData {
    eventId: string;
}

export interface ChangeReservationStatusData {
    status: ReservationStatus;
}
