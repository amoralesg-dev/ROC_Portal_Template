import { APP_INITIALIZER, InjectionToken, Provider } from '@angular/core';
import { AuthConfiguration } from '../models/auth-config.model';
import { Auth } from '../services/auth';
import { catchError, of, lastValueFrom } from 'rxjs';

export const AUTH_CONFIG = new InjectionToken<AuthConfiguration>('AUTH_CONFIG', {
    providedIn: 'root',
    factory: () => ({
        loginUrl: '',
        refreshUrl: '',
        meUrl: '',
        accessTokenStorageKey: 'accessToken',
        refreshTokenStorageKey: 'refreshToken'
    })
});

export function provideRassiniAuth(config: AuthConfiguration): Provider[] {
    return [
        {
            provide: AUTH_CONFIG,
            useFactory: () => {
                const finalConfig = {
                    accessTokenStorageKey: 'accessToken',
                    refreshTokenStorageKey: 'refreshToken',
                    ...config
                };
                console.log('AUTH_CONFIG constructed with:', finalConfig);
                return finalConfig;
            }
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (auth: Auth) => {
                return async () => {
                    console.log('APP_INITIALIZER RUNNING');

                    // Si el AS nos redirigió aquí con ?oidc_logout=1, el usuario acaba
                    // de hacer logout explícito desde una aplicación OIDC.
                    // Limpiamos los tokens y credenciales del portal ANTES de intentar restoreSession()
                    // para evitar que el APP_INITIALIZER re-autentique silenciosamente.
                    const isPostOidcLogout = typeof window !== 'undefined' &&
                        new URLSearchParams(window.location.search).get('oidc_logout') === '1';

                    if (isPostOidcLogout) {
                        console.log('APP_INITIALIZER: oidc_logout=1 detectado — limpiando sesión local del portal');
                        auth.logout();
                        sessionStorage.removeItem('auth_usuario');
                        sessionStorage.removeItem('auth_nombre');
                        sessionStorage.removeItem('auth_bu');
                        sessionStorage.removeItem('auth_rol');
                        sessionStorage.removeItem('auth_contingencia');
                        if (typeof window !== 'undefined' && window.history && window.location) {
                            const cleanUrl = window.location.pathname;
                            window.history.replaceState({}, document.title, cleanUrl);
                        }
                        return true;
                    }

                    if (auth.isAuthenticated()) {
                        try {
                            await lastValueFrom(
                                auth.restoreSession().pipe(
                                    catchError(err => {
                                        console.error('APP_INITIALIZER restoreSession failed', err);
                                        auth.logout();
                                        return of(null);
                                    })
                                )
                            );
                        } catch (e) {
                            console.error('APP_INITIALIZER unhandled error', e);
                            auth.logout();
                        }
                    }
                    return true;
                };
            },
            deps: [Auth],
            multi: true
        }
    ];
}
