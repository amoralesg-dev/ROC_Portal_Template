import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { ContextService } from '../services/context.service';
import { MissingContextPlaceholderError, CorporateOidcConfig } from '../models/corporate.models';
import { TokenStorageAdapter } from '../storage/token-storage.adapter';

class MockTokenStorageAdapter implements TokenStorageAdapter {
  private store = new Map<string, string>();
  getAccessToken(): string | null { return this.store.get('access_token') || null; }
  setAccessToken(token: string): void { this.store.set('access_token', token); }
  getIdToken(): string | null { return null; }
  setIdToken(token: string): void {}
  getTokens(): any { return null; }
  setTokens(tokens: any): void {}
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) || null; }
  setItem(key: string, value: string): void { this.store.set(key, value); }
  removeItem(key: string): void { this.store.delete(key); }
}

function createJwt(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

describe('Corporate SDK - ContextService', () => {
  let authService: AuthenticationService;
  let contextService: ContextService;
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
        { provide: ContextService, useClass: ContextService }
      ]
    });

    authService = injector.get(AuthenticationService);
    contextService = injector.get(ContextService);
    authService.setStorageAdapter(new MockTokenStorageAdapter());
    authService.setConfig(mockConfig);
  });

  it('1. Resuelve USER_ID, EMPLOYEE_ID, USERNAME, EMAIL, APPLICATION_CODE', () => {
    const jwt = createJwt({
      sub: 'amoralesg',
      userId: 55,
      employeeId: 'EMP-999',
      email: 'amoralesg@rassini.com',
      roles: ['USER'],
      permissions: [],
      businessUnits: [],
      hasAllBusinessUnits: false
    });
    authService.applyTokens({ accessToken: jwt });

    const template = 'User: ${USERNAME}, ID: ${USER_ID}, Emp: ${EMPLOYEE_ID}, Email: ${EMAIL}, App: ${APPLICATION_CODE}';
    const result = contextService.resolvePlaceholders(template);

    expect(result).toBe('User: amoralesg, ID: 55, Emp: EMP-999, Email: amoralesg@rassini.com, App: MS_PAGOS');
  });

  it('2. BUSINESS_UNIT con BU activa - resuelve correctamente', () => {
    const jwt = createJwt({
      sub: 'user1',
      businessUnits: [{ id: 1, code: 'BU_SAN_MARTIN', name: 'San Martin' }],
      hasAllBusinessUnits: false
    });
    authService.applyTokens({ accessToken: jwt });

    const result = contextService.resolvePlaceholders('Unit is: ${BUSINESS_UNIT}');
    expect(result).toBe('Unit is: BU_SAN_MARTIN');
  });

  it('3. BUSINESS_UNIT sin BU activa en modo estricto - lanza MissingContextPlaceholderError', () => {
    const jwt = createJwt({
      sub: 'user2',
      businessUnits: [{ id: 1, code: 'BU_1' }, { id: 2, code: 'BU_2' }],
      hasAllBusinessUnits: false
    });
    authService.applyTokens({ accessToken: jwt });

    expect(() => contextService.resolvePlaceholders('Unit is: ${BUSINESS_UNIT}', { strict: true }))
      .toThrowError(MissingContextPlaceholderError);
  });

  it('4. BUSINESS_UNIT sin BU activa en modo tolerante - reemplaza por vacio', () => {
    const jwt = createJwt({
      sub: 'user2',
      businessUnits: [{ id: 1, code: 'BU_1' }, { id: 2, code: 'BU_2' }],
      hasAllBusinessUnits: false
    });
    authService.applyTokens({ accessToken: jwt });

    const result = contextService.resolvePlaceholders('Unit: [${BUSINESS_UNIT}]', { strict: false });
    expect(result).toBe('Unit: []');
  });

  it('5. BUSINESS_UNITS - resuelve lista separada por comas', () => {
    const jwt = createJwt({
      sub: 'user3',
      businessUnits: [{ id: 1, code: 'BU_A' }, { id: 2, code: 'BU_B' }],
      hasAllBusinessUnits: false
    });
    authService.applyTokens({ accessToken: jwt });

    const result = contextService.resolvePlaceholders('BUs: ${BUSINESS_UNITS}');
    expect(result).toBe('BUs: BU_A,BU_B');
  });

  it('6. Placeholder desconocido en modo estricto - lanza error tipado', () => {
    expect(() => contextService.resolvePlaceholders('Unknown: ${UNKNOWN_VAR}', { strict: true }))
      .toThrowError(MissingContextPlaceholderError);
  });

  it('7. Encodings: RAW, PATH_SEGMENT, QUERY_PARAM', () => {
    const jwt = createJwt({
      sub: 'john doe',
      email: 'john+test@rassini.com'
    });
    authService.applyTokens({ accessToken: jwt });

    const raw = contextService.resolvePlaceholders('/search?q=${EMAIL}', { encoding: 'RAW' });
    expect(raw).toBe('/search?q=john+test@rassini.com');

    const encoded = contextService.resolvePlaceholders('/search?q=${EMAIL}', { encoding: 'QUERY_PARAM' });
    expect(encoded).toBe('/search?q=john%2Btest%40rassini.com');
  });
});
