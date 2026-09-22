import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { rassiniTokenInterceptor } from '../interceptors/rassini-token.interceptor';
import { Router } from '@angular/router';

describe('Corporate SDK - OAuth Refresh & 401/403 Concurrency Protection', () => {
  let authService: AuthenticationService;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useClass: AuthenticationService },
        { provide: Router, useValue: { navigate: () => {} } }
      ]
    });

    authService = injector.get(AuthenticationService);
    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'ms-pagos-client',
      redirectUri: 'http://localhost:4201/callback',
      applicationCode: 'MS_PAGOS',
      allowedApiOrigins: ['http://localhost:8083']
    });
    authService.getStorageAdapter().setAccessToken('current.token');
  });

  it('1. Error 403 Forbidden navega a /access-denied y no destruye la sesion', async () => {
    let navigatedTo: string | null = null;
    const mockRouter = { navigate: (commands: string[]) => { navigatedTo = commands[0]; } };

    const localInjector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useValue: authService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const req = new HttpRequest('GET', 'http://localhost:8083/api/restricted');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 403 }));

    await expect(new Promise((_, reject) => {
      (localInjector as any).runInContext(() => {
        rassiniTokenInterceptor(req, next).subscribe({ error: reject });
      });
    })).rejects.toBeDefined();

    expect(navigatedTo).toBe('/access-denied');
    expect(authService.getStorageAdapter().getAccessToken()).toBe('current.token');
  });

  it('2. Error 401 no recuperable limpia la sesion y redirige a login sin loops', async () => {
    let navigatedTo: string | null = null;
    const mockRouter = { navigate: (commands: string[]) => { navigatedTo = commands[0]; } };

    const localInjector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useValue: authService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const req = new HttpRequest('GET', 'http://localhost:8083/api/data');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401 }));

    await expect(new Promise((_, reject) => {
      (localInjector as any).runInContext(() => {
        rassiniTokenInterceptor(req, next).subscribe({ error: reject });
      });
    })).rejects.toBeDefined();

    expect(navigatedTo).toBe('/auth/login');
    expect(authService.getStorageAdapter().getAccessToken()).toBeNull();
  });

  it('3. Ausencia de refresh token no intenta llamar al endpoint de refresh', async () => {
    let refreshAttempted = false;
    authService.refreshToken = () => {
      refreshAttempted = true;
      return throwError(() => new Error('Should not be called'));
    };

    authService.getStorageAdapter().removeItem('rassini_auth_refresh_token');

    let navigatedTo: string | null = null;
    const mockRouter = { navigate: (commands: string[]) => { navigatedTo = commands[0]; } };

    const localInjector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useValue: authService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const req = new HttpRequest('GET', 'http://localhost:8083/api/data');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401 }));

    await expect(new Promise((_, reject) => {
      (localInjector as any).runInContext(() => {
        rassiniTokenInterceptor(req, next).subscribe({ error: reject });
      });
    })).rejects.toBeDefined();

    expect(refreshAttempted).toBe(false);
    expect(navigatedTo).toBe('/auth/login');
  });

  it('4. Refresh exitoso rota tokens y actualiza storage', async () => {
    const mockHttp = {
      post: () => of({
        access_token: 'new.access.token',
        refresh_token: 'new.refresh.token',
        token_type: 'Bearer',
        expires_in: 3600
      })
    };

    const localInjector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: AuthenticationService, useClass: AuthenticationService }
      ]
    });

    const svc = localInjector.get(AuthenticationService);
    svc.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'ms-pagos-client',
      redirectUri: 'http://localhost:4201/callback',
      applicationCode: 'MS_PAGOS',
      allowedApiOrigins: ['http://localhost:8083']
    });
    svc.getStorageAdapter().setRefreshToken('old.refresh.token');

    const result = await new Promise<any>((resolve, reject) => {
      svc.refreshToken().subscribe({ next: resolve, error: reject });
    });

    expect(result.accessToken).toBe('new.access.token');
    expect(result.refreshToken).toBe('new.refresh.token');
    expect(svc.getAccessToken()).toBe('new.access.token');
    expect(svc.getRefreshToken()).toBe('new.refresh.token');
  });

  it('5. Error 400 invalid_grant en refresh token ejecuta logout coordinado', async () => {
    const mockHttp = {
      post: () => throwError(() => new HttpErrorResponse({ status: 400, error: { error: 'invalid_grant' } }))
    };

    const localInjector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttp },
        { provide: AuthenticationService, useClass: AuthenticationService }
      ]
    });

    const svc = localInjector.get(AuthenticationService);
    svc.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'ms-pagos-client',
      redirectUri: 'http://localhost:4201/callback',
      applicationCode: 'MS_PAGOS',
      allowedApiOrigins: ['http://localhost:8083']
    });
    svc.getStorageAdapter().setAccessToken('old.at');
    svc.getStorageAdapter().setRefreshToken('expired.rt');

    await expect(new Promise((_, reject) => {
      svc.refreshToken().subscribe({ error: reject });
    })).rejects.toBeDefined();

    expect(svc.getAccessToken()).toBeNull();
    expect(svc.getRefreshToken()).toBeNull();
  });
});
