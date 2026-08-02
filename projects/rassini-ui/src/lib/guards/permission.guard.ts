import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const permissionGuard: CanActivateFn = (route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);

    const requiredPermission = route.data['permission'];
    const userPermissions = auth.getPermissions();

    if (!requiredPermission || userPermissions.includes(requiredPermission) || userPermissions.includes('IAM_ADMIN')) {
        return true;
    }

    return router.parseUrl('/access-denied');
};
