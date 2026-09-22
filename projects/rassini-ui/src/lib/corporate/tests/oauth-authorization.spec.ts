import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { CorporateOidcConfig } from '../models/corporate.models';

describe('Corporate SDK - OAuth Authorization & PKCE Engine', () => {
  let authService: AuthenticationService;
  let injector: Injector;

  const config: CorporateOidcConfig = {
    issuer: 'http://localhost:8083',
    clientId: 'ms-pagos-client',
    redirectUri: 'http://localhost:4201/callback',
    applicationCode: 'MS_PAGOS',
    scope: 'openid profile email',
    allowedApiOrigins: ['http://localhost:8083']
  };

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useClass: AuthenticationService }
      ]
    });
    authService = injector.get(AuthenticationService);
    authService.setConfig(config);
  });

  it('1. buildAuthorizationUrl genera URL con client_id, redirect_uri, response_type=code y scopes', async () => {
    const authUrl = await authService.buildAuthorizationUrl();
    const url = new URL(authUrl);

    expect(url.origin).toBe('http://localhost:8083');
    expect(url.pathname).toBe('/oauth2/authorize');
    expect(url.searchParams.get('client_id')).toBe('ms-pagos-client');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:4201/callback');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid profile email');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.has('code_challenge')).toBe(true);
    expect(url.searchParams.has('state')).toBe(true);
    expect(url.searchParams.has('nonce')).toBe(true);
  });

  it('2. PKCE S256: code_verifier generado con entropia criptografica y almacenado en storage', async () => {
    await authService.buildAuthorizationUrl();
    const storage = authService.getStorageAdapter();
    const verifier = storage.getItem('rassini_auth_verifier');
    const state = storage.getItem('rassini_auth_state');
    const nonce = storage.getItem('rassini_auth_nonce');

    expect(verifier).not.toBeNull();
    expect(verifier!.length).toBeGreaterThanOrEqual(43);
    expect(state).not.toBeNull();
    expect(state!.length).toBe(32);
    expect(nonce).not.toBeNull();
    expect(nonce!.length).toBe(32);
  });

  it('3. No existe clientSecret en la configuracion publica del cliente SPA', () => {
    const activeConfig: any = authService.getConfig();
    expect(activeConfig.clientSecret).toBeUndefined();
  });

  it('4. PKCE y Estado usan llaves aisladas y segmentadas en storage', async () => {
    await authService.buildAuthorizationUrl();
    const storage = authService.getStorageAdapter();
    expect(storage.getItem('rassini_auth_state')).toBeTruthy();
    expect(storage.getItem('rassini_auth_nonce')).toBeTruthy();
    expect(storage.getItem('rassini_auth_verifier')).toBeTruthy();
  });

  it('5. buildAuthorizationUrl falla si issuer esta vacio o ausente', async () => {
    authService.setConfig({
      issuer: '',
      clientId: 'ms-pagos-client',
      redirectUri: 'http://localhost:4201/callback',
      applicationCode: 'MS_PAGOS',
      allowedApiOrigins: ['http://localhost:8083']
    });

    await expect(authService.buildAuthorizationUrl()).rejects.toThrowError(/missing valid issuer/);
  });

  it('6. buildAuthorizationUrl falla si clientId esta vacio o ausente', async () => {
    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: '',
      redirectUri: 'http://localhost:4201/callback',
      applicationCode: 'MS_PAGOS',
      allowedApiOrigins: ['http://localhost:8083']
    });

    await expect(authService.buildAuthorizationUrl()).rejects.toThrowError(/missing valid clientId/);
  });

  it('7. buildAuthorizationUrl falla si redirectUri es invalida', async () => {
    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'ms-pagos-client',
      redirectUri: 'not-a-valid-url',
      applicationCode: 'MS_PAGOS',
      allowedApiOrigins: ['http://localhost:8083']
    });

    await expect(authService.buildAuthorizationUrl()).rejects.toThrowError(/invalid redirectUri format/);
  });
});
