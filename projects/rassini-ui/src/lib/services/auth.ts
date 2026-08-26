import { Injectable, Inject, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthConfiguration } from '../models/auth-config.model';
import { AUTH_CONFIG } from '../providers/auth.provider';
import { AuthUser, AuthMenu, AuthBusinessUnit } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class Auth {
    private readonly http = inject(HttpClient);

    // ── Signals tipados ─────────────────────────────────────────────────────
    readonly currentUser         = signal<AuthUser | null>(null);
    readonly roles               = signal<string[]>([]);
    readonly permissions         = signal<string[]>([]);
    readonly menus               = signal<AuthMenu[]>([]);
    readonly businessUnits       = signal<AuthBusinessUnit[]>([]);
    readonly hasAllBusinessUnits = signal<boolean>(false);
    readonly defaultBusinessUnit = signal<AuthBusinessUnit | null>(null);

    constructor(@Inject(AUTH_CONFIG) private readonly config: AuthConfiguration) {
        // Initialization moved to APP_INITIALIZER
    }

    // ── Autenticación ────────────────────────────────────────────────────────

    login(username: string, password: string): Observable<unknown> {
        return this.http.post<AuthApiResponse>(this.config.loginUrl, { username, password }).pipe(
            tap(res => {
                const tokenKey   = this.config.accessTokenStorageKey  || 'accessToken';
                const refreshKey = this.config.refreshTokenStorageKey || 'refreshToken';

                if (res.accessToken)  localStorage.setItem(tokenKey,   res.accessToken);
                if (res.refreshToken) localStorage.setItem(refreshKey, res.refreshToken);

                this._applyContext(res);
            })
        );
    }

    logout(): Observable<unknown> | void {
        localStorage.clear();
        sessionStorage.clear();

        this.currentUser.set(null);
        this.roles.set([]);
        this.permissions.set([]);
        this.menus.set([]);
        this.businessUnits.set([]);
        this.hasAllBusinessUnits.set(false);
        this.defaultBusinessUnit.set(null);

        if (this.config.logoutUrl) {
            return this.http.post(this.config.logoutUrl, {}).pipe(
                catchError(err => {
                    console.error('Logout error', err);
                    return throwError(() => err);
                })
            );
        }
    }

    refreshToken(): Observable<unknown> {
        const refreshKey   = this.config.refreshTokenStorageKey || 'refreshToken';
        const refreshToken = localStorage.getItem(refreshKey);
        return this.http.post<AuthApiResponse>(this.config.refreshUrl, { refreshToken }).pipe(
            tap(res => {
                const tokenKey = this.config.accessTokenStorageKey || 'accessToken';
                if (res.accessToken)  localStorage.setItem(tokenKey,   res.accessToken);
                if (res.refreshToken) localStorage.setItem(refreshKey, res.refreshToken);
            })
        );
    }

    getCurrentUser(): Observable<unknown> {
        return this.http.get<AuthApiResponse>(this.config.meUrl).pipe(
            tap(res => this._applyContext(res))
        );
    }

    // ── Helpers de acceso ────────────────────────────────────────────────────

    getPermissions(): string[] {
        return this.permissions();
    }

    getMenus(): AuthMenu[] {
        return this.menus();
    }

    getBusinessUnits(): AuthBusinessUnit[] {
        return this.businessUnits();
    }

    isAuthenticated(): boolean {
        const tokenKey = this.config.accessTokenStorageKey || 'accessToken';
        return !!localStorage.getItem(tokenKey);
    }

    loadContext(): Observable<unknown> {
        return this.getCurrentUser();
    }

    restoreSession(): Observable<unknown> {
        console.log('RESTORE SESSION CALLED');
        console.log('CALLING /auth/me');
        return this.getCurrentUser().pipe(
            tap(() => {
                console.log('ME RESPONSE applied');
                console.log('currentUser =>',         this.currentUser());
                console.log('roles =>',               this.roles());
                console.log('permissions =>',         this.permissions());
                console.log('menus =>',               this.menus());
                console.log('businessUnits =>',       this.businessUnits());
                console.log('hasAllBusinessUnits =>', this.hasAllBusinessUnits());
                console.log('defaultBusinessUnit =>', this.defaultBusinessUnit());
            }),
            catchError(err => {
                console.error('Error restoring session from /auth/me', err);
                return throwError(() => err);
            })
        );
    }

    // ── Privado ──────────────────────────────────────────────────────────────

    /** Aplica todos los campos del response de /login o /me a los signals. */
    private _applyContext(res: AuthApiResponse): void {
        if (res.user)        this.currentUser.set(res.user);
        if (res.roles)       this.roles.set(res.roles);
        if (res.permissions) this.permissions.set(res.permissions);
        if (res.menus)       this.menus.set(res.menus);

        this.businessUnits.set(res.businessUnits ?? []);
        this.hasAllBusinessUnits.set(res.hasAllBusinessUnits ?? false);
        this.defaultBusinessUnit.set(res.defaultBusinessUnit ?? null);
    }
}

// ── Tipo interno del response de /login y /me ──────────────────────────────
// No se exporta: es un detalle de implementación del servicio.
// Los consumidores usan los signals tipados directamente.
interface AuthApiResponse {
    accessToken?:          string;
    refreshToken?:         string;
    user?:                 AuthUser;
    roles?:                string[];
    permissions?:          string[];
    menus?:                AuthMenu[];
    businessUnits?:        AuthBusinessUnit[];
    hasAllBusinessUnits?:  boolean;
    defaultBusinessUnit?:  AuthBusinessUnit | null;
}