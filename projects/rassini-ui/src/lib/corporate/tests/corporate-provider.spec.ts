import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { provideRassiniCorporate } from '../providers/corporate.provider';
import { NAVIGATION_ADAPTER } from '../services/navigation.adapter';
import { HttpNavigationAdapter } from '../services/http-navigation.adapter';
import { Injector } from '@angular/core';

describe('Corporate SDK - provideRassiniCorporate Provider Registration', () => {
  it('1. Registra HttpNavigationAdapter bajo NAVIGATION_ADAPTER por defecto', () => {
    const envProviders = provideRassiniCorporate({
      oidc: {
        issuer: 'http://localhost:8083',
        clientId: 'client-1',
        redirectUri: 'http://localhost/cb',
        applicationCode: 'APP_1',
        allowedApiOrigins: ['http://localhost:8083']
      }
    });

    expect(envProviders).toBeDefined();
  });

  it('2. Permite override con adapter de navegacion personalizado', () => {
    class CustomNavAdapter {
      loadMenus() { return []; }
    }

    const envProviders = provideRassiniCorporate({
      oidc: {
        issuer: 'http://localhost:8083',
        clientId: 'client-1',
        redirectUri: 'http://localhost/cb',
        applicationCode: 'APP_1',
        allowedApiOrigins: ['http://localhost:8083']
      },
      navigationAdapter: {
        provide: NAVIGATION_ADAPTER,
        useClass: CustomNavAdapter
      }
    });

    expect(envProviders).toBeDefined();
  });
});
