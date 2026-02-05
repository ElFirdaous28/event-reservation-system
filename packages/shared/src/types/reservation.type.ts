import { ReservationStatus } from '../enums/reservation-status.enum';
import { User } from './user.type';

export type SafeReservation = {
    id: string;
    user: User;
    event: Event;
    status: ReservationStatus;
    createdAt: Date;
};
