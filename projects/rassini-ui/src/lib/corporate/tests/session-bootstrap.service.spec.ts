import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { NavigationService } from '../services/navigation.service';
import { ContextService } from '../services/context.service';
import { SessionBootstrapService } from '../services/session-bootstrap.service';
import { HttpNavigationAdapter } from '../services/http-navigation.adapter';
import { NAVIGATION_ADAPTER } from '../services/navigation.adapter';
import { CorporateOidcConfig } from '../models/corporate.models';

describe('Corporate SDK - SessionBootstrapService', () => {
  let bootstrapService: SessionBootstrapService;
  let authService: AuthenticationService;
  let navService: NavigationService;
  let injector: Injector;

  const mockConfig: CorporateOidcConfig = {
    issuer: 'http://localhost:8083',
    clientId: 'ms-pagos-client',
    redirectUri: 'http://localhost:4201/callback',
    applicationCode: 'MS_PAGOS',
    allowedApiOrigins: ['http://localhost:8083']
  };

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useClass: AuthenticationService },
        { provide: ContextService, useClass: ContextService },
        { provide: HttpNavigationAdapter, useClass: HttpNavigationAdapter },
        { provide: NAVIGATION_ADAPTER, useClass: HttpNavigationAdapter },
        { provide: NavigationService, useClass: NavigationService },
        { provide: SessionBootstrapService, useClass: SessionBootstrapService }
      ]
    });

    authService = injector.get(AuthenticationService);
    navService = injector.get(NavigationService);
    bootstrapService = injector.get(SessionBootstrapService);
  });

  it('1. Arranque sin sesion - ready y authReady permanecen en false', async () => {
    const success = await bootstrapService.initialize(mockConfig);

    expect(success).toBe(false);
    expect(bootstrapService.authReady()).toBe(false);
    expect(bootstrapService.ready()).toBe(false);
  });

  it('2. Arranque con token valido existente en storage', async () => {
    const jwt = `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify({
      sub: 'test_demo',
      roles: ['USER'],
      exp: Math.floor(Date.now() / 1000) + 3600
    }))}.sig`;

    authService.getStorageAdapter().setAccessToken(jwt);
    navService.setAdapter({ loadMenus: () => of([]) });

    const success = await bootstrapService.initialize(mockConfig);

    expect(success).toBe(true);
    expect(bootstrapService.authReady()).toBe(true);
    expect(bootstrapService.contextReady()).toBe(true);
    expect(bootstrapService.navigationReady()).toBe(true);
    expect(bootstrapService.ready()).toBe(true);
  });

  it('3. Fallo de navegacion sin failOnNavigationError no destruye autenticacion ni sesion', async () => {
    const jwt = `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify({
      sub: 'test_demo',
      exp: Math.floor(Date.now() / 1000) + 3600
    }))}.sig`;
    authService.getStorageAdapter().setAccessToken(jwt);

    // Adaptador que falla
    navService.setAdapter({
      loadMenus: () => throwError(() => new Error('Server 500 error'))
    });

    const success = await bootstrapService.initialize(mockConfig, { failOnNavigationError: false });

    expect(success).toBe(true);
    expect(bootstrapService.authReady()).toBe(true);
    expect(bootstrapService.navigationReady()).toBe(true); // Se maneja tolerante
    expect(bootstrapService.ready()).toBe(true);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('4. Idempotencia: dos llamadas simultaneas devuelven la misma promesa y no duplican ejecucion', async () => {
    const p1 = bootstrapService.initialize(mockConfig);
    const p2 = bootstrapService.initialize(mockConfig);

    expect(p1).toBe(p2);
    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toBe(res2);
  });
});
