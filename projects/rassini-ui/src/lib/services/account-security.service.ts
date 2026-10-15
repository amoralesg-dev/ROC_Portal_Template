import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Auth } from './auth';
import { AUTH_CONFIG } from '../providers/auth.provider';
import { AuthenticationService } from '../corporate/services/authentication.service';

/**
 * Operaciones de cuenta del menú de usuario del header corporativo
 * (cambiar contraseña, 2FA).
 *
 * Unifica los dos mecanismos de sesión de la librería:
 *  - Sesión legacy (`Auth` + `provideRassiniAuth`): Employee Portal. Usa las URLs de `AUTH_CONFIG`.
 *  - Sesión OIDC corporativa (`AuthenticationService` + `provideRassiniCorporate`): Portal CxP y demás
 *    apps. Usa los mismos endpoints `/api/v1/auth/*` del issuer; el token Bearer lo agrega
 *    `rassiniTokenInterceptor`.
 *
 * Así cualquier app que use rui-shell obtiene la misma experiencia sin duplicar lógica.
 */
@Injectable({ providedIn: 'root' })
export class AccountSecurityService {
    private readonly http = inject(HttpClient);
    private readonly auth = inject(Auth);
    private readonly config = inject(AUTH_CONFIG);
    private readonly corporateAuth = inject(AuthenticationService, { optional: true });

    private readonly oidcMfaEnabled = signal(false);
    private readonly oidcMfaRequired = signal(false);

    get isOidcSession(): boolean {
        return !!(this.corporateAuth && this.corporateAuth.getConfig() && this.corporateAuth.isAuthenticated());
    }

    get mfaEnabled(): boolean {
        return this.isOidcSession ? this.oidcMfaEnabled() : (this.auth.currentUser()?.mfaEnabled ?? false);
    }

    get mfaRequired(): boolean {
        return this.isOidcSession ? this.oidcMfaRequired() : (this.auth.currentUser()?.mfaRequired ?? false);
    }

    get userId(): string | number | null {
        if (this.isOidcSession) {
            return this.corporateAuth!.currentUser()?.userId ?? null;
        }
        return this.auth.currentUser()?.id ?? null;
    }

    private oidcUrl(path: string): string {
        const issuer = (this.corporateAuth!.getConfig()!.issuer || '').replace(/\/+$/, '');
        return `${issuer}/api/v1/auth/${path}`;
    }

    changePasswordUrl(): string {
        if (this.isOidcSession) {
            return this.oidcUrl('change-password');
        }
        return this.config.changePasswordUrl || `/api/users/{id}/change-password`;
    }

    changePassword(payload: unknown): Observable<unknown> {
        const url = this.changePasswordUrl().replace('{id}', String(this.userId));
        return this.http.post(url, payload);
    }

    /** Cierra la sesión tras un cambio de contraseña exitoso, según el mecanismo activo. */
    logoutAfterPasswordChange(): void {
        if (this.isOidcSession) {
            void this.corporateAuth!.logout();
            return;
        }
        this.auth.logout();
    }

    setupMfa(): Observable<any> {
        return this.isOidcSession ? this.http.get(this.oidcUrl('mfa/setup')) : this.auth.setupMfa();
    }

    activateMfa(code: string): Observable<any> {
        return this.isOidcSession ? this.http.post(this.oidcUrl('mfa/activate'), { code }) : this.auth.activateMfa(code);
    }

    disableMfa(password: string, code: string): Observable<any> {
        return this.isOidcSession
            ? this.http.post(this.oidcUrl('mfa/disable'), { password, code })
            : this.auth.disableMfa(password, code);
    }

    /** Refresca el estado de MFA del usuario (/auth/me) para el mecanismo activo. */
    refreshContext(): Observable<unknown> {
        if (!this.isOidcSession) {
            return this.auth.loadContext();
        }
        return this.http.get<any>(this.oidcUrl('me')).pipe(
            tap(res => this.applyOidcUser(res?.user ?? res)),
            catchError(() => of(null))
        );
    }

    private applyOidcUser(user: any): void {
        this.oidcMfaEnabled.set(!!user?.mfaEnabled);
        this.oidcMfaRequired.set(!!user?.mfaRequired);
    }
}
