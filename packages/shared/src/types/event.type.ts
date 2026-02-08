import { EventStatus } from '../enums/event-status.enum';
import { User } from './user.type';

export type Event = {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  availableSeats:number;
  status: EventStatus;
  createdBy: User
};

export interface CreateEventDto {
  title: string;
  description?: string;
  date: string;
  location: string;
  capacity: number;
  availableSeats?: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface ChangeEventStatusDto {
  status: EventStatus;
}

export interface EventFilters {
  status?: EventStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}
