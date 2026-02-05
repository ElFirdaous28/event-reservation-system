import { Role } from '../enums';

export type User = {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
}
