import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { ContextService } from '../services/context.service';
import { NavigationService } from '../services/navigation.service';
import { NavigationAdapter, NAVIGATION_ADAPTER } from '../services/navigation.adapter';
import { HttpNavigationAdapter } from '../services/http-navigation.adapter';
import { CorporateNavigationMenu, CorporateOidcConfig } from '../models/corporate.models';

class MockTestNavigationAdapter implements NavigationAdapter {
  constructor(private readonly mockMenus: CorporateNavigationMenu[]) {}
  loadMenus(appCode: string) {
    return of(this.mockMenus);
  }
}

describe('Corporate SDK - NavigationService', () => {
  let navService: NavigationService;
  let authService: AuthenticationService;
  let injector: Injector;

  const sampleMenus: CorporateNavigationMenu[] = [
    {
      id: 1,
      code: 'PORTAL_PAGOS',
      label: 'Portal Pagos',
      route: null,
      targetType: 'EXTERNO',
      externalUrl: 'http://localhost:4201/?bu=${BUSINESS_UNIT}',
      children: [
        {
          id: 2,
          code: 'PAGOS_AUTORIZAR',
          label: 'Autorizar Pagos',
          route: '/pagos/autorizar',
          children: []
        }
      ]
    },
    {
      id: 3,
      code: 'PORTAL_RH',
      label: 'Portal RH',
      route: '/rh/dashboard',
      children: []
    }
  ];

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useClass: AuthenticationService },
        { provide: ContextService, useClass: ContextService },
        { provide: HttpNavigationAdapter, useClass: HttpNavigationAdapter },
        { provide: NAVIGATION_ADAPTER, useClass: HttpNavigationAdapter },
        { provide: NavigationService, useClass: NavigationService }
      ]
    });

    authService = injector.get(AuthenticationService);
    navService = injector.get(NavigationService);

    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'client-1',
      redirectUri: 'http://localhost/cb',
      applicationCode: 'APP_CORE',
      allowedApiOrigins: ['http://localhost:8083']
    });
  });

  it('1. Carga y jerarquia de menus con adaptador mock de prueba', async () => {
    navService.setAdapter(new MockTestNavigationAdapter(sampleMenus));

    const menus = await new Promise<CorporateNavigationMenu[]>(resolve => {
      navService.loadNavigation().subscribe(res => resolve(res));
    });

    expect(menus.length).toBe(2);
    expect(menus[0].code).toBe('PORTAL_PAGOS');
    expect(menus[0].children?.length).toBe(1);
    expect(menus[0].children?.[0].code).toBe('PAGOS_AUTORIZAR');
    expect(navService.loaded()).toBe(true);
    expect(navService.loading()).toBe(false);
  });

  it('2. findMenuItemByRoute - encuentra elementos anidados y raices', async () => {
    navService.setAdapter(new MockTestNavigationAdapter(sampleMenus));
    await new Promise(r => navService.loadNavigation().subscribe(r));

    const foundNested = navService.findMenuItemByRoute('/pagos/autorizar');
    expect(foundNested).not.toBeNull();
    expect(foundNested?.label).toBe('Autorizar Pagos');

    const notFound = navService.findMenuItemByRoute('/non-existent');
    expect(notFound).toBeNull();
  });

  it('3. getFlatMenus - aplana arbol de navegacion', async () => {
    navService.setAdapter(new MockTestNavigationAdapter(sampleMenus));
    await new Promise(r => navService.loadNavigation().subscribe(r));

    const flat = navService.getFlatMenus();
    expect(flat.length).toBe(3);
    const codes = flat.map(f => f.code);
    expect(codes).toContain('PORTAL_PAGOS');
    expect(codes).toContain('PAGOS_AUTORIZAR');
    expect(codes).toContain('PORTAL_RH');
  });

  it('4. Resolucion de resolvedUrl en items con externalUrl y placeholders', async () => {
    // Autenticar usuario con 1 BU activa
    authService.applyTokens({
      accessToken: `${btoa(JSON.stringify({ alg: 'RS256' }))}.${btoa(JSON.stringify({
        sub: 'user1',
        businessUnits: [{ id: 1, code: 'BU_MEX' }]
      }))}.signature`
    });

    navService.setAdapter(new MockTestNavigationAdapter(sampleMenus));
    const menus = await new Promise<CorporateNavigationMenu[]>(r => navService.loadNavigation().subscribe(r));

    expect(menus[0].resolvedUrl).toBe('http://localhost:4201/?bu=BU_MEX');
  });
});
