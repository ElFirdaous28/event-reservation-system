import { Role } from '../enums';

export type User = {
    _id?: string;
    name: string;
    email: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
}
