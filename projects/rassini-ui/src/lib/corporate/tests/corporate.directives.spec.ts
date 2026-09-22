import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';

describe('Corporate SDK - Structural Directives (Reactivity & Signals)', () => {
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

  it('1. Directivas reaccionan reactivamente a los signals de roles, permisos y BUs', () => {
    expect(authService.hasRole('ROLE_ADMIN')).toBe(false);

    authService.roles.set(['ROLE_ADMIN']);
    expect(authService.hasRole('ROLE_ADMIN')).toBe(true);

    authService.permissions.set(['PAYMENTS_APPROVE']);
    expect(authService.hasPermission('PAYMENTS_APPROVE')).toBe(true);

    authService.businessUnits.set([{ id: 1, code: 'BU_MEX', name: 'Mexico' }]);
    expect(authService.hasBusinessUnit('BU_MEX')).toBe(true);
    expect(authService.hasBusinessUnit('BU_USA')).toBe(false);
  });
});
