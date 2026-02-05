import { EventStatus } from '../enums/event-status.enum';
import { User } from './user.type';

export type Event = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  status: EventStatus;
  createdBy: User
};
