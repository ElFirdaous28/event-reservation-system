import { EventStatus } from '../enums';
export interface Event {
    _id?: string;
    title: string;
    description?: string;
    date: Date;
    location: string;
    maxCapacity: number;
    status: EventStatus;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
