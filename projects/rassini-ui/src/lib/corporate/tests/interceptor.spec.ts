import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { rassiniTokenInterceptor } from '../interceptors/rassini-token.interceptor';
import { Router } from '@angular/router';

describe('Corporate SDK - RassiniTokenInterceptor', () => {
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
      allowedApiOrigins: ['http://localhost:8083', 'https://api.rassini.com']
    });

    // Guardar token en storage
    authService.getStorageAdapter().setAccessToken('mock.jwt.token');
  });

  const runInterceptor = (url: string): Promise<HttpRequest<unknown>> => {
    return new Promise((resolve) => {
      const req = new HttpRequest('GET', url);
      const next: HttpHandlerFn = (interceptedReq) => {
        resolve(interceptedReq);
        return of(new HttpResponse({ status: 200 }));
      };

      // Correr interceptor en el contexto de inyeccion
      (injector as any).runInContext(() => {
        rassiniTokenInterceptor(req, next).subscribe();
      });
    });
  };

  it('1. Adjunta token Bearer a origen permitido (allowlist)', async () => {
    const intercepted = await runInterceptor('http://localhost:8083/api/pagos');
    expect(intercepted.headers.has('Authorization')).toBe(true);
    expect(intercepted.headers.get('Authorization')).toBe('Bearer mock.jwt.token');
  });

  it('2. NO adjunta token a origen NO permitido (no esta en allowlist)', async () => {
    const intercepted = await runInterceptor('http://localhost:9090/untrusted-api');
    expect(intercepted.headers.has('Authorization')).toBe(false);
  });

  it('3. NO adjunta token a URL de tercero no corporativo', async () => {
    const intercepted = await runInterceptor('https://google.com/api/test');
    expect(intercepted.headers.has('Authorization')).toBe(false);
  });

  it('4. NO adjunta token al endpoint /oauth2/token para evitar bucles de refresh', async () => {
    const intercepted = await runInterceptor('http://localhost:8083/oauth2/token');
    expect(intercepted.headers.has('Authorization')).toBe(false);
  });
});
