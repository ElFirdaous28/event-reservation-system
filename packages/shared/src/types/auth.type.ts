import { Role } from '../enums';

export interface JwtPayload {
    sub: string;
    userId: string;
    email: string;
    role: string;
    fullName: string;
}

export interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    role?: Role;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    message?: string;
}