import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const rassiniAuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  const hasToken = authService.hasValidTokenInStorage();
  const isAuth = authService.isAuthenticated();
  console.log(`[RASSINI AUTH GUARD] Evaluando ruta "${state?.url}" | isAuthenticated=${isAuth} | hasValidToken=${hasToken} | user=${authService.currentUser()?.username || 'null'}`);

  if (hasToken || isAuth) {
    if (!isAuth && hasToken) {
      authService.restoreSession();
    }
    return true;
  }

  try {
    if (state?.url) {
      authService.getStorageAdapter().setItem('rassini_redirect_url', state.url);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('rassini_redirect_url', state.url);
      }
    }
    const authUrl = await authService.buildAuthorizationUrl();
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = authUrl;
    }
    return false;
  } catch (err) {
    console.error('Failed to initiate corporate authorization', err);
    return router.createUrlTree(['/access-denied']);
  }
};

export const rassiniRoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/access-denied']);
  }

  const requiredRole = route.data['role'] as string;
  if (!requiredRole || authService.hasRole(requiredRole)) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};

export const rassiniPermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/access-denied']);
  }

  const requiredPermission = route.data['permission'] as string;
  if (!requiredPermission || authService.hasPermission(requiredPermission)) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};

export const rassiniBusinessUnitGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/access-denied']);
  }

  const requiredBu = route.data['businessUnit'] as string;
  if (!requiredBu || authService.hasBusinessUnit(requiredBu)) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
