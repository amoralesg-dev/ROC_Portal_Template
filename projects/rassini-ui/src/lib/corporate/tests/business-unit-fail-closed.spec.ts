import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService, MissingApplicationCodeError } from '../services/authentication.service';
import { 
  BusinessUnitCatalogAdapter,
  MissingBusinessUnitCatalogError,
  UnauthorizedBusinessUnitError
} from '../services/business-unit-catalog.adapter';
import { CorporateBusinessUnit, CorporateOidcConfig } from '../models/corporate.models';

function createJwt(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.mock-signature`;
}

describe('Corporate SDK - hasAllBusinessUnits Fail-Closed & applicationCode Enforcement', () => {
  let authService: AuthenticationService;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: {} },
        { provide: AuthenticationService, useClass: AuthenticationService }
      ]
    });

    authService = injector.get(AuthenticationService);
  });

  it('1. applicationCode ausente o vacio genera MissingApplicationCodeError', () => {
    expect(() => authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'client-1',
      redirectUri: 'http://localhost/cb',
      applicationCode: '',
      allowedApiOrigins: ['http://localhost:8083']
    })).toThrowError(MissingApplicationCodeError);
  });

  it('2. hasAllBusinessUnits con catalogo confiable permite seleccionar BU valida', () => {
    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'client-1',
      redirectUri: 'http://localhost/cb',
      applicationCode: 'APP_CORE',
      allowedApiOrigins: ['http://localhost:8083']
    });

    const jwt = createJwt({
      sub: 'global_admin',
      hasAllBusinessUnits: true,
      businessUnits: []
    });
    authService.applyTokens({ accessToken: jwt });

    const trustedCatalog: CorporateBusinessUnit[] = [
      { id: 10, code: 'BU_MEX', name: 'Mexico' },
      { id: 20, code: 'BU_USA', name: 'USA' }
    ];

    authService.setActiveBusinessUnit({ id: 10, code: 'BU_MEX', name: 'Mexico' }, trustedCatalog);
    expect(authService.activeBusinessUnit()?.code).toBe('BU_MEX');
  });

  it('3. hasAllBusinessUnits sin catalogo (fail-closed) lanza MissingBusinessUnitCatalogError', () => {
    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'client-1',
      redirectUri: 'http://localhost/cb',
      applicationCode: 'APP_CORE',
      allowedApiOrigins: ['http://localhost:8083']
    });

    const jwt = createJwt({
      sub: 'global_admin',
      hasAllBusinessUnits: true,
      businessUnits: []
    });
    authService.applyTokens({ accessToken: jwt });

    // Intento de pasar BU fabricada sin catálogo confiable
    expect(() => authService.setActiveBusinessUnit({ id: 99, code: 'BU_FAKE', name: 'Fake' }))
      .toThrowError(MissingBusinessUnitCatalogError);
  });

  it('4. hasAllBusinessUnits con catalogo rechaza BU no incluida con UnauthorizedBusinessUnitError', () => {
    authService.setConfig({
      issuer: 'http://localhost:8083',
      clientId: 'client-1',
      redirectUri: 'http://localhost/cb',
      applicationCode: 'APP_CORE',
      allowedApiOrigins: ['http://localhost:8083']
    });

    const jwt = createJwt({
      sub: 'global_admin',
      hasAllBusinessUnits: true,
      businessUnits: []
    });
    authService.applyTokens({ accessToken: jwt });

    const trustedCatalog: CorporateBusinessUnit[] = [
      { id: 10, code: 'BU_MEX', name: 'Mexico' }
    ];

    expect(() => authService.setActiveBusinessUnit({ id: 99, code: 'BU_UNKNOWN', name: 'Unknown' }, trustedCatalog))
      .toThrowError(UnauthorizedBusinessUnitError);
  });
});
