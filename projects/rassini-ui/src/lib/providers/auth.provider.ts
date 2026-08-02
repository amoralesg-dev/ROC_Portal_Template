import { InjectionToken, Provider } from '@angular/core';
import { AuthConfiguration } from '../models/auth-config.model';

export const AUTH_CONFIG = new InjectionToken<AuthConfiguration>('AUTH_CONFIG');

export function provideRassiniAuth(config: AuthConfiguration): Provider[] {
    return [
        {
            provide: AUTH_CONFIG,
            useValue: {
                accessTokenStorageKey: 'accessToken',
                refreshTokenStorageKey: 'refreshToken',
                ...config
            }
        }
    ];
}
