import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from 'src/role/role.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private roleService: RoleService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);


        if (!requiredPermissions) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            console.log('User or user.role not found', user);
            throw new ForbiddenException('User role not found');
        }


        if (user.role === 'super_admin') {
            console.log('super admin access granted');
            return true;
        }

        const permissions = await this.roleService.GetPermissions(user.role);

        console.log('User role:', user.role);
        console.log('Required permissions:', requiredPermissions);
        console.log('User permissions:', permissions);

        const hasPermission = requiredPermissions.every((p) => permissions.includes(p));

        if (!hasPermission) {
            console.log('Access denied for user role:', user.role);
            throw new ForbiddenException('Access denied');
        }

        return true;
    }
}