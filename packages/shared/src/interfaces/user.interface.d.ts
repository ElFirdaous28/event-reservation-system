import { Role } from '../enums';
export interface User {
    _id?: string;
    name: string;
    email: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
}
