import { APP_INITIALIZER, InjectionToken, Provider } from '@angular/core';
import { AuthConfiguration } from '../models/auth-config.model';
import { Auth } from '../services/auth';
import { catchError, of, lastValueFrom } from 'rxjs';

export const AUTH_CONFIG = new InjectionToken<AuthConfiguration>('AUTH_CONFIG');

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
                    if (auth.isAuthenticated()) {
                        try {
                            await lastValueFrom(
                                auth.restoreSession().pipe(
                                    catchError(err => {
                                        console.error('APP_INITIALIZER restoreSession failed', err);
                                        return of(null);
                                    })
                                )
                            );
                        } catch (e) {
                            console.error('APP_INITIALIZER unhandled error', e);
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
