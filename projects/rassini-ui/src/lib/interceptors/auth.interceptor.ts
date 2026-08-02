import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Auth } from '../services/auth';
import { AUTH_CONFIG } from '../providers/auth.provider';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(Auth);
    const config = inject(AUTH_CONFIG);

    const tokenKey = config.accessTokenStorageKey || 'accessToken';
    const token = localStorage.getItem(tokenKey);

    // Skip intercepting login and refresh requests
    const isLogin = req.url.includes(config.loginUrl);
    const isRefresh = req.url.includes(config.refreshUrl);

    if (token && !isLogin && !isRefresh) {
        req = addTokenHeader(req, token);
    }

    return next(req).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401 && !isLogin && !isRefresh) {
                return handle401Error(req, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: Auth) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
            switchMap((res: any) => {
                isRefreshing = false;
                refreshTokenSubject.next(res.accessToken);
                return next(addTokenHeader(request, res.accessToken));
            }),
            catchError((err) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => err);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next(addTokenHeader(request, token)))
        );
    }
}
