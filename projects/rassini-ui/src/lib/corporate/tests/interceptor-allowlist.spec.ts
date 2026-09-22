import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpResponse, HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { rassiniTokenInterceptor } from '../interceptors/rassini-token.interceptor';
import { Router } from '@angular/router';

describe('Corporate SDK - RassiniTokenInterceptor URL Parsing, Allowlist & Path Boundary', () => {
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
      allowedApiOrigins: ['https://api.rassini.com/api/pagos', 'http://localhost:8083']
    });

    authService.getStorageAdapter().setAccessToken('valid.bearer.token');
  });

  const runInterceptor = (url: string): Promise<HttpRequest<unknown>> => {
    return new Promise((resolve) => {
      const req = new HttpRequest('GET', url);
      const next: HttpHandlerFn = (interceptedReq) => {
        resolve(interceptedReq);
        return of(new HttpResponse({ status: 200 }));
      };

      (injector as any).runInContext(() => {
        rassiniTokenInterceptor(req, next).subscribe();
      });
    });
  };

  it('1. Permitida: /api/pagos exacto', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pagos');
    expect(res.headers.has('Authorization')).toBe(true);
    expect(res.headers.get('Authorization')).toBe('Bearer valid.bearer.token');
  });

  it('2. Permitida: /api/pagos/ con trailing slash', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pagos/');
    expect(res.headers.has('Authorization')).toBe(true);
  });

  it('3. Permitida: /api/pagos/123 segmento hijo', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pagos/123');
    expect(res.headers.has('Authorization')).toBe(true);
  });

  it('4. Permitida: /api/pagos/proveedores segmento hijo', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pagos/proveedores');
    expect(res.headers.has('Authorization')).toBe(true);
  });

  it('5. Bloqueada: /api/pagos-malicioso (no respeta frontera de segmento)', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pagos-malicioso');
    expect(res.headers.has('Authorization')).toBe(false);
  });

  it('6. Bloqueada: /api/pagoss (extension de palabra no autorizada)', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pagoss');
    expect(res.headers.has('Authorization')).toBe(false);
  });

  it('7. Bloqueada: /api/pagos_archivo (underscore no autorizado)', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pagos_archivo');
    expect(res.headers.has('Authorization')).toBe(false);
  });

  it('8. Bloqueada: /api/pago (segmento incompleto)', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/pago');
    expect(res.headers.has('Authorization')).toBe(false);
  });

  it('9. Bloqueada: /api/PAGOS (case-sensitive estricto)', async () => {
    const res = await runInterceptor('https://api.rassini.com/api/PAGOS');
    expect(res.headers.has('Authorization')).toBe(false);
  });
});
