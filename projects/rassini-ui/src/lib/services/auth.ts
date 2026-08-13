import { Injectable, Inject, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthConfiguration } from '../models/auth-config.model';
import { AUTH_CONFIG } from '../providers/auth.provider';

@Injectable({
    providedIn: 'root'
})
export class Auth {
    private readonly http = inject(HttpClient);

    // Context signals
    readonly currentUser = signal<any>(null);
    readonly roles = signal<string[]>([]);
    readonly permissions = signal<string[]>([]);
    readonly menus = signal<any[]>([]);

    constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfiguration) {
        // Initialization moved to APP_INITIALIZER
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post<any>(this.config.loginUrl, { username, password }).pipe(
            tap(res => {
                const tokenKey = this.config.accessTokenStorageKey || 'accessToken';
                const refreshKey = this.config.refreshTokenStorageKey || 'refreshToken';
                
                if (res.accessToken) {
                    localStorage.setItem(tokenKey, res.accessToken);
                }
                if (res.refreshToken) {
                    localStorage.setItem(refreshKey, res.refreshToken);
                }

                if (res.user) this.currentUser.set(res.user);
                if (res.roles) this.roles.set(res.roles);
                if (res.permissions) this.permissions.set(res.permissions);
                if (res.menus) this.menus.set(res.menus);
            })
        );
    }

    logout(): Observable<any> | void {
        const tokenKey = this.config.accessTokenStorageKey || 'accessToken';
        const refreshKey = this.config.refreshTokenStorageKey || 'refreshToken';
        
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshKey);

        this.currentUser.set(null);
        this.roles.set([]);
        this.permissions.set([]);
        this.menus.set([]);

        if (this.config.logoutUrl) {
            return this.http.post(this.config.logoutUrl, {}).pipe(
                catchError(err => {
                    console.error('Logout error', err);
                    return throwError(() => err);
                })
            );
        }
    }

    refreshToken(): Observable<any> {
        const refreshKey = this.config.refreshTokenStorageKey || 'refreshToken';
        const refreshToken = localStorage.getItem(refreshKey);
        return this.http.post<any>(this.config.refreshUrl, { refreshToken }).pipe(
            tap(res => {
                const tokenKey = this.config.accessTokenStorageKey || 'accessToken';
                if (res.accessToken) {
                    localStorage.setItem(tokenKey, res.accessToken);
                }
                if (res.refreshToken) {
                    localStorage.setItem(refreshKey, res.refreshToken);
                }
            })
        );
    }

    getCurrentUser(): Observable<any> {
        return this.http.get<any>(this.config.meUrl).pipe(
            tap(res => {
                if (res.user) this.currentUser.set(res.user);
                if (res.roles) this.roles.set(res.roles);
                if (res.permissions) this.permissions.set(res.permissions);
                if (res.menus) this.menus.set(res.menus);
            })
        );
    }

    getPermissions(): string[] {
        return this.permissions();
    }

    getMenus(): any[] {
        return this.menus();
    }

    isAuthenticated(): boolean {
        const tokenKey = this.config.accessTokenStorageKey || 'accessToken';
        return !!localStorage.getItem(tokenKey);
    }

    loadContext(): Observable<any> {
        return this.getCurrentUser();
    }

    restoreSession(): Observable<any> {
        console.log('RESTORE SESSION CALLED');
        console.log('CALLING /auth/me');
        return this.getCurrentUser().pipe(
            tap(response => {
                console.log('ME RESPONSE', response);
                console.log('currentUser =>', this.currentUser());
                console.log('roles =>', this.roles());
                console.log('permissions =>', this.permissions());
                console.log('menus =>', this.menus());
            }),
            catchError(err => {
                console.error('Error restoring session from /auth/me', err);
                return throwError(() => err);
            })
        );
    }
}