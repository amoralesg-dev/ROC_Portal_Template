import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { HttpNavigationAdapter } from '../services/http-navigation.adapter';
import { AuthenticationService } from '../services/authentication.service';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { Injector } from '@angular/core';

describe('Corporate SDK - HttpNavigationAdapter', () => {
  let adapter: HttpNavigationAdapter;
  let authService: AuthenticationService;
  let mockHttpClient: any;
  let injector: Injector;

  beforeEach(() => {
    mockHttpClient = {
      get: (url: string) => of({
        menus: [
          { id: 1, code: 'MENU_1', label: 'Menu 1', children: [] }
        ]
      })
    };

    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: AuthenticationService, useClass: AuthenticationService },
        { provide: HttpNavigationAdapter, useClass: HttpNavigationAdapter }
      ]
    });

    adapter = injector.get(HttpNavigationAdapter);
    authService = injector.get(AuthenticationService);
    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'client-test',
      redirectUri: 'http://localhost/cb',
      applicationCode: 'MS_TEST',
      allowedApiOrigins: ['http://localhost:8083']
    });
  });

  it('1. Consume el endpoint configurado /api/v1/auth/me y mapea menus devueltos', async () => {
    const menus = await new Promise<any[]>(resolve => {
      adapter.loadMenus('MS_TEST').subscribe(resolve);
    });

    expect(menus.length).toBe(1);
    expect(menus[0].code).toBe('MENU_1');
  });

  it('2. Manejo de respuesta vacia - devuelve arreglo vacio sin error', async () => {
    mockHttpClient.get = () => of({});
    const menus = await new Promise<any[]>(resolve => {
      adapter.loadMenus('MS_TEST').subscribe(resolve);
    });

    expect(menus).toEqual([]);
  });

  it('3. Manejo de error HTTP - propaga el error de forma controlada', async () => {
    mockHttpClient.get = () => throwError(() => new Error('HTTP 500'));
    await expect(new Promise((_, reject) => {
      adapter.loadMenus('MS_TEST').subscribe({ error: reject });
    })).rejects.toThrowError('HTTP 500');
  });
});
