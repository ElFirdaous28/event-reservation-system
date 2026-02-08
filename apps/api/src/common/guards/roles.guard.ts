import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@repo/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No roles required, allow access
        }

        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user as any;

        if (!user || !user.role) {
            return false;
        }

        // Compare user role with required roles
        return requiredRoles.some((role) => {
            const roleStr = typeof role === 'string' ? role : String(role);
            const userRoleStr = typeof user.role === 'string' ? user.role : String(user.role);
            return userRoleStr === roleStr;
        });
    }
}
