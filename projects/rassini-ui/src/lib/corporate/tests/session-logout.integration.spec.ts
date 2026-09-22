import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { NavigationService } from '../services/navigation.service';
import { ContextService } from '../services/context.service';
import { SessionBootstrapService } from '../services/session-bootstrap.service';
import { HttpNavigationAdapter } from '../services/http-navigation.adapter';
import { NAVIGATION_ADAPTER } from '../services/navigation.adapter';
import { CorporateOidcConfig } from '../models/corporate.models';

describe('Corporate SDK - Session Logout Coordination (Full Multi-User Isolation)', () => {
  let bootstrapService: SessionBootstrapService;
  let authService: AuthenticationService;
  let navService: NavigationService;
  let contextService: ContextService;
  let injector: Injector;

  const mockConfig: CorporateOidcConfig = {
    issuer: 'http://localhost:8083',
    clientId: 'ms-pagos-client',
    redirectUri: 'http://localhost:4201/callback',
    applicationCode: 'MS_PAGOS',
    allowedApiOrigins: ['http://localhost:8083']
  };

  beforeEach(async () => {
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
    contextService = injector.get(ContextService);
    bootstrapService = injector.get(SessionBootstrapService);
  });

  it('1. Usuario A inicia, selecciona BU, carga menus, cierra sesion y Usuario B no hereda contexto', () => {
    authService.setConfig(mockConfig);

    // 1. Usuario A inicia sesion
    const jwtA = `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify({
      sub: 'usuario_a',
      userId: 100,
      employeeId: 'EMP-A',
      email: 'a@rassini.com',
      roles: ['ROLE_USER_A'],
      permissions: ['PERM_A'],
      businessUnits: [{ id: 1, code: 'BU_A', name: 'Unit A' }],
      hasAllBusinessUnits: false,
      exp: Math.floor(Date.now() / 1000) + 3600
    }))}.sig`;

    authService.applyTokens({ accessToken: jwtA });
    navService.menus.set([{ id: 1, code: 'MENU_A', label: 'Menu A', route: '/a' }]);

    expect(authService.currentUser()?.username).toBe('usuario_a');
    expect(authService.activeBusinessUnit()?.code).toBe('BU_A');
    expect(contextService.resolvePlaceholders('${USERNAME}')).toBe('usuario_a');
    expect(navService.menus().length).toBe(1);

    // 2. Usuario A ejecuta logout coordinado
    bootstrapService.logout();

    // Verificaciones de limpieza total
    expect(authService.currentUser()).toBeNull();
    expect(authService.roles()).toEqual([]);
    expect(authService.permissions()).toEqual([]);
    expect(authService.businessUnits()).toEqual([]);
    expect(authService.activeBusinessUnit()).toBeNull();
    expect(authService.hasAllBusinessUnits()).toBe(false);
    expect(authService.isAuthenticated()).toBe(false);

    expect(navService.menus()).toEqual([]);
    expect(navService.loading()).toBe(false);
    expect(navService.loaded()).toBe(false);
    expect(navService.error()).toBeNull();

    expect(bootstrapService.authReady()).toBe(false);
    expect(bootstrapService.contextReady()).toBe(false);
    expect(bootstrapService.navigationReady()).toBe(false);
    expect(bootstrapService.ready()).toBe(false);

    expect(authService.getStorageAdapter().getAccessToken()).toBeNull();
    expect(authService.getStorageAdapter().getItem('rassini:MS_PAGOS:usuario_a:activeBusinessUnit')).toBeNull();

    // 3. Usuario B inicia sesion
    const jwtB = `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify({
      sub: 'usuario_b',
      userId: 200,
      employeeId: 'EMP-B',
      email: 'b@rassini.com',
      roles: ['ROLE_USER_B'],
      permissions: ['PERM_B'],
      businessUnits: [{ id: 2, code: 'BU_B', name: 'Unit B' }],
      hasAllBusinessUnits: false,
      exp: Math.floor(Date.now() / 1000) + 3600
    }))}.sig`;

    authService.applyTokens({ accessToken: jwtB });

    // Usuario B no debe tener datos del Usuario A
    expect(authService.currentUser()?.username).toBe('usuario_b');
    expect(authService.activeBusinessUnit()?.code).toBe('BU_B');
    expect(authService.roles()).toEqual(['ROLE_USER_B']);
    expect(contextService.resolvePlaceholders('${USERNAME}')).toBe('usuario_b');
    expect(contextService.resolvePlaceholders('${BUSINESS_UNIT}')).toBe('BU_B');
  });
});
