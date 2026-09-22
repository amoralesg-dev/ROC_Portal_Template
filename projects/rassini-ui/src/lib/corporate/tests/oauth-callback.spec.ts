import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { CorporateOidcConfig } from '../models/corporate.models';

describe('Corporate SDK - OAuth Callback Processing', () => {
  let authService: AuthenticationService;
  let mockHttpClient: any;
  let injector: Injector;

  const config: CorporateOidcConfig = {
    issuer: 'http://localhost:8083',
    clientId: 'ms-pagos-client',
    redirectUri: 'http://localhost:4201/callback',
    applicationCode: 'MS_PAGOS',
    allowedApiOrigins: ['http://localhost:8083']
  };

  beforeEach(() => {
    mockHttpClient = {
      post: () => of({
        access_token: 'mock.access.token',
        id_token: `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify({ nonce: 'valid-nonce-123' }))}.sig`,
        token_type: 'Bearer',
        expires_in: 3600
      })
    };

    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: AuthenticationService, useClass: AuthenticationService }
      ]
    });

    authService = injector.get(AuthenticationService);
    authService.setConfig(config);
  });

  it('1. Callback valido intercambia codigo por tokens y limpia parametros temporales', async () => {
    const storage = authService.getStorageAdapter();
    storage.setItem('rassini_auth_state', 'expected-state');
    storage.setItem('rassini_auth_verifier', 'expected-verifier');
    storage.setItem('rassini_auth_nonce', 'valid-nonce-123');

    const tokens = await new Promise((resolve, reject) => {
      authService.handleCallback('code-abc', 'expected-state').subscribe({
        next: resolve,
        error: reject
      });
    });

    expect(tokens).toBeDefined();
    // Limpieza de estados temporales
    expect(storage.getItem('rassini_auth_state')).toBeNull();
    expect(storage.getItem('rassini_auth_verifier')).toBeNull();
    expect(storage.getItem('rassini_auth_nonce')).toBeNull();
  });

  it('2. Callback con state diferente lanza error y limpia estado temporal', async () => {
    const storage = authService.getStorageAdapter();
    storage.setItem('rassini_auth_state', 'original-state');
    storage.setItem('rassini_auth_verifier', 'verifier-123');

    await expect(new Promise((_, reject) => {
      authService.handleCallback('code-abc', 'tampered-state').subscribe({ error: reject });
    })).rejects.toThrowError(/Invalid OAuth2 state parameter/);

    expect(storage.getItem('rassini_auth_state')).toBeNull();
    expect(storage.getItem('rassini_auth_verifier')).toBeNull();
  });

  it('3. Callback sin verifier lanza error', async () => {
    const storage = authService.getStorageAdapter();
    storage.setItem('rassini_auth_state', 'valid-state');
    storage.removeItem('rassini_auth_verifier');

    await expect(new Promise((_, reject) => {
      authService.handleCallback('code-abc', 'valid-state').subscribe({ error: reject });
    })).rejects.toThrowError(/Missing OAuth2 PKCE code verifier/);
  });

  it('4. Callback con ID Token y nonce discordante lanza error', async () => {
    const storage = authService.getStorageAdapter();
    storage.setItem('rassini_auth_state', 'valid-state');
    storage.setItem('rassini_auth_verifier', 'valid-verifier');
    storage.setItem('rassini_auth_nonce', 'different-expected-nonce');

    await expect(new Promise((_, reject) => {
      authService.handleCallback('code-abc', 'valid-state').subscribe({ error: reject });
    })).rejects.toThrowError(/Invalid OpenID Connect ID token nonce/);
  });

  it('5. Callback sin codigo de autorizacion lanza error y rechaza peticion', async () => {
    const storage = authService.getStorageAdapter();
    storage.setItem('rassini_auth_state', 'valid-state');
    storage.setItem('rassini_auth_verifier', 'valid-verifier');

    await expect(new Promise((_, reject) => {
      authService.handleCallback('', 'valid-state').subscribe({ error: reject });
    })).rejects.toThrowError(/Missing authorization code in callback/);
  });

  it('6. Reintento o repeticion de callback falla porque el state ya fue consumido', async () => {
    const storage = authService.getStorageAdapter();
    storage.setItem('rassini_auth_state', 'single-use-state');
    storage.setItem('rassini_auth_verifier', 'single-use-verifier');
    storage.setItem('rassini_auth_nonce', 'valid-nonce-123');

    // Primera ejecucion exitosa
    await new Promise((resolve, reject) => {
      authService.handleCallback('code-abc', 'single-use-state').subscribe({
        next: resolve,
        error: reject
      });
    });

    // Segunda ejecucion con el mismo callback debe fallar
    await expect(new Promise((_, reject) => {
      authService.handleCallback('code-abc', 'single-use-state').subscribe({ error: reject });
    })).rejects.toThrowError(/Invalid OAuth2 state parameter/);
  });

  it('7. Error en endpoint de token propaga error tipado y no bloquea el cliente', async () => {
    mockHttpClient.post = () => throwError(() => new Error('invalid_grant: Code expired or invalid'));
    const storage = authService.getStorageAdapter();
    storage.setItem('rassini_auth_state', 'error-state');
    storage.setItem('rassini_auth_verifier', 'error-verifier');

    await expect(new Promise((_, reject) => {
      authService.handleCallback('expired-code', 'error-state').subscribe({ error: reject });
    })).rejects.toThrowError(/invalid_grant/);
  });
});
