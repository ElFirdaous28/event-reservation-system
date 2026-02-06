import { Role } from '../enums';

export type User = {
    _id?: string;
    fullName: string;
    email: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
}
