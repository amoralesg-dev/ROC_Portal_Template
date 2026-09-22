import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function normalizePath(path: string): string {
  if (!path || path === '/' || path.trim() === '') {
    return '/';
  }
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function isPathAllowed(requestPath: string, configuredPath: string): boolean {
  const allowedPath = normalizePath(configuredPath);
  if (allowedPath === '/') {
    return true;
  }
  return requestPath === allowedPath || requestPath.startsWith(allowedPath + '/');
}

function isOriginAllowed(requestUrlStr: string, allowedOrigins: string[]): boolean {
  try {
    const baseOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';
    const requestUrl = new URL(requestUrlStr, baseOrigin);

    return allowedOrigins.some(allowedOriginStr => {
      try {
        const allowedUrl = new URL(allowedOriginStr, baseOrigin);
        const protocolMatch = requestUrl.protocol === allowedUrl.protocol;
        const hostnameMatch = requestUrl.hostname === allowedUrl.hostname;
        const portMatch = requestUrl.port === allowedUrl.port;

        if (!protocolMatch || !hostnameMatch || !portMatch) {
          return false;
        }

        // Validate exact path boundary if configured
        if (allowedUrl.pathname && allowedUrl.pathname !== '/' && allowedUrl.pathname !== '') {
          return isPathAllowed(requestUrl.pathname, allowedUrl.pathname);
        }

        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

export const rassiniTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);
  const config = authService.getConfig();

  if (!config) {
    return next(req);
  }

  // 1. Check Allowlist: Allowed API Origins with strict URL & path boundary parsing
  const isAllowedOrigin = isOriginAllowed(req.url, config.allowedApiOrigins);
  const isAuthServerTokenReq = req.url.includes('/oauth2/token');

  if (!isAllowedOrigin || isAuthServerTokenReq) {
    return next(req);
  }

  // 2. Attach Bearer token if available
  const token = authService.getAccessToken();
  let authReq = req;
  if (token) {
    authReq = addTokenHeader(req, token);
  }

  // 3. Handle response errors with Mutex single-flight refresh queue
  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 403) {
          // 403 Forbidden: Do not destroy token or logout, navigate to access-denied
          router.navigate(['/access-denied']);
          return throwError(() => error);
        }

        if (error.status === 401) {
          const refreshToken = authService.getRefreshToken();
          if (!refreshToken) {
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          }

          if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return authService.refreshToken().pipe(
              switchMap((tokens) => {
                isRefreshing = false;
                refreshTokenSubject.next(tokens.accessToken);
                return next(addTokenHeader(req, tokens.accessToken));
              }),
              catchError((refreshErr) => {
                isRefreshing = false;
                authService.logout();
                router.navigate(['/auth/login']);
                return throwError(() => refreshErr);
              })
            );
          } else {
            // Queue concurrent requests behind single-flight refresh
            return refreshTokenSubject.pipe(
              filter(newToken => newToken !== null),
              take(1),
              switchMap(newToken => next(addTokenHeader(req, newToken!)))
            );
          }
        }
      }
      return throwError(() => error);
    })
  );
};
