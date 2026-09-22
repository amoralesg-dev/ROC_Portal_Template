import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { TokenStorageAdapter } from '../storage/token-storage.adapter';
import { CorporateTokens, CorporateOidcConfig, CorporateBusinessUnit } from '../models/corporate.models';

class MockTokenStorageAdapter implements TokenStorageAdapter {
  private store = new Map<string, string>();

  getAccessToken(): string | null {
    return this.store.get('access_token') || null;
  }
  setAccessToken(token: string): void {
    this.store.set('access_token', token);
  }
  getIdToken(): string | null {
    return this.store.get('id_token') || null;
  }
  setIdToken(token: string): void {
    this.store.set('id_token', token);
  }
  getTokens(): CorporateTokens | null {
    const at = this.getAccessToken();
    if (!at) return null;
    return { accessToken: at, idToken: this.getIdToken() || undefined };
  }
  setTokens(tokens: CorporateTokens): void {
    if (tokens.accessToken) this.setAccessToken(tokens.accessToken);
    if (tokens.idToken) this.setIdToken(tokens.idToken);
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

function createJwt(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

describe('Corporate SDK - AuthenticationService', () => {
  let authService: AuthenticationService;
  let mockStorage: MockTokenStorageAdapter;
  let injector: Injector;

  const mockConfig: CorporateOidcConfig = {
    issuer: 'http://localhost:8083',
    clientId: 'ms-pagos-client',
    redirectUri: 'http://localhost:4201/callback',
    applicationCode: 'MS_PAGOS',
    allowedApiOrigins: ['http://localhost:8083', 'http://localhost:8084']
  };

  beforeEach(() => {
    mockStorage = new MockTokenStorageAdapter();
    const mockHttp = {} as HttpClient;
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: AuthenticationService, useClass: AuthenticationService }
      ]
    });

    authService = injector.get(AuthenticationService);
    authService.setStorageAdapter(mockStorage);
    authService.setConfig(mockConfig);
  });

  it('1. Token valido - hidrata usuario y claims correctamente', () => {
    const jwt = createJwt({
      sub: 'test_demo',
      userId: 101,
      employeeId: 'EMP-001',
      email: 'test@rassini.com',
      roles: ['ROLE_USER', 'ROLE_PAYMENTS'],
      permissions: ['PAYMENTS_READ', 'PAYMENTS_CREATE'],
      businessUnits: [{ id: 1, code: 'BU-MEX', name: 'Mexico' }],
      hasAllBusinessUnits: false,
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    authService.applyTokens({ accessToken: jwt });

    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.currentUser()?.username).toBe('test_demo');
    expect(authService.currentUser()?.userId).toBe(101);
    expect(authService.currentUser()?.employeeId).toBe('EMP-001');
    expect(authService.roles()).toEqual(['ROLE_USER', 'ROLE_PAYMENTS']);
    expect(authService.permissions()).toEqual(['PAYMENTS_READ', 'PAYMENTS_CREATE']);
    expect(authService.hasRole('ROLE_USER')).toBe(true);
    expect(authService.hasPermission('PAYMENTS_READ')).toBe(true);
  });

  it('2. Token expirado - restoreSession falla y limpia sesion', () => {
    const expiredJwt = createJwt({
      sub: 'test_demo',
      exp: Math.floor(Date.now() / 1000) - 3600
    });

    mockStorage.setAccessToken(expiredJwt);
    const result = authService.restoreSession();

    expect(result).toBe(false);
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.currentUser()).toBeNull();
  });

  it('3. Token ausente - restoreSession devuelve false', () => {
    const result = authService.restoreSession();
    expect(result).toBe(false);
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('4. Claims mal formados - decodeToken devuelve null con seguridad', () => {
    const malformed = 'invalid.jwt.token';
    const claims = authService.decodeToken(malformed);
    expect(claims).toBeNull();
  });

  it('5. Roles y permisos vacios - inicializa arreglos vacios', () => {
    const jwt = createJwt({
      sub: 'basic_user',
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    authService.applyTokens({ accessToken: jwt });
    expect(authService.roles()).toEqual([]);
    expect(authService.permissions()).toEqual([]);
    expect(authService.hasRole('ROLE_ADMIN')).toBe(false);
  });

  it('6. Una sola Business Unit - seleccion automatica de activeBusinessUnit', () => {
    const singleBu = { id: 10, code: 'BU_BRAZIL', name: 'Brazil Unit' };
    const jwt = createJwt({
      sub: 'single_bu_user',
      businessUnits: [singleBu],
      hasAllBusinessUnits: false,
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    authService.applyTokens({ accessToken: jwt });
    expect(authService.activeBusinessUnit()?.code).toBe('BU_BRAZIL');
  });

  it('7. Multiples Business Units - activeBusinessUnit inicia en null (requiere seleccion)', () => {
    const bu1 = { id: 1, code: 'BU_MEX', name: 'Mexico' };
    const bu2 = { id: 2, code: 'BU_USA', name: 'USA' };
    const jwt = createJwt({
      sub: 'multi_bu_user',
      businessUnits: [bu1, bu2],
      hasAllBusinessUnits: false,
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    authService.applyTokens({ accessToken: jwt });
    expect(authService.activeBusinessUnit()).toBeNull();

    // Seleccion valida
    authService.setActiveBusinessUnit(bu1);
    expect(authService.activeBusinessUnit()?.code).toBe('BU_MEX');
  });

  it('8. activeBusinessUnit invalida - rechaza BU no autorizada con error tipado', () => {
    const bu1 = { id: 1, code: 'BU_MEX', name: 'Mexico' };
    const unauthorizedBu = { id: 99, code: 'BU_UNAUTHORIZED', name: 'Unauthorized' };
    const jwt = createJwt({
      sub: 'restricted_user',
      businessUnits: [bu1],
      hasAllBusinessUnits: false,
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    authService.applyTokens({ accessToken: jwt });
    expect(() => authService.setActiveBusinessUnit(unauthorizedBu)).toThrowError(
      /not in authorized units/
    );
  });

  it('9. hasAllBusinessUnits - con catalogo confiable permite seleccionar BU y arranca en null', () => {
    const jwt = createJwt({
      sub: 'corporate_admin',
      businessUnits: [],
      hasAllBusinessUnits: true,
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    authService.applyTokens({ accessToken: jwt });
    expect(authService.hasAllBusinessUnits()).toBe(true);
    expect(authService.activeBusinessUnit()).toBeNull();

    const trustedCatalog: CorporateBusinessUnit[] = [
      { id: 5, code: 'ANY_BU', name: 'Any Valid BU' }
    ];
    authService.setActiveBusinessUnit({ id: 5, code: 'ANY_BU', name: 'Any Valid BU' }, trustedCatalog);
    expect(authService.activeBusinessUnit()?.code).toBe('ANY_BU');
  });

  it('10. Logout - limpia storage, signals y contexto completamente', () => {
    const jwt = createJwt({
      sub: 'test_demo',
      roles: ['ADMIN'],
      permissions: ['ALL'],
      businessUnits: [{ id: 1, code: 'BU_1', name: 'BU 1' }],
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    authService.applyTokens({ accessToken: jwt });
    expect(authService.isAuthenticated()).toBe(true);

    authService.logout();

    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.currentUser()).toBeNull();
    expect(authService.roles()).toEqual([]);
    expect(authService.permissions()).toEqual([]);
    expect(authService.businessUnits()).toEqual([]);
    expect(authService.activeBusinessUnit()).toBeNull();
    expect(mockStorage.getAccessToken()).toBeNull();
  });
});
