import { ReservationStatus } from '../enums';

export type Reservation = {
    _id?: string;
    event: string;
    participant: string;
    status: ReservationStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
