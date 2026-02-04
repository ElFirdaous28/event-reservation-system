import { ReservationStatus } from '../enums';

export interface Reservation {
    _id?: string;
    event: string;
    participant: string;
    status: ReservationStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
