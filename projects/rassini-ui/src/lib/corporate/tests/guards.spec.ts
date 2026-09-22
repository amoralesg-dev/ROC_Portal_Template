import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../services/authentication.service';
import { rassiniRoleGuard, rassiniPermissionGuard, rassiniBusinessUnitGuard } from '../guards/rassini-corporate.guards';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

describe('Corporate SDK - Guards', () => {
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
  });

  const createSnapshot = (data: any): ActivatedRouteSnapshot => {
    return { data } as unknown as ActivatedRouteSnapshot;
  };

  it('1. rassiniRoleGuard - permite rol autorizado y rechaza no autorizado', () => {
    authService.roles.set(['ROLE_USER', 'ROLE_PAYMENTS']);

    (injector as any).runInContext(() => {
      const allowed = rassiniRoleGuard(createSnapshot({ role: 'ROLE_PAYMENTS' }), {} as any);
      expect(allowed).toBe(true);

      const denied = rassiniRoleGuard(createSnapshot({ role: 'ROLE_ADMIN' }), {} as any);
      expect(denied).toBe(false);
    });
  });

  it('2. rassiniPermissionGuard - evalua permisos granulares', () => {
    authService.permissions.set(['PAYMENTS_CREATE', 'PAYMENTS_APPROVE']);

    (injector as any).runInContext(() => {
      const allowed = rassiniPermissionGuard(createSnapshot({ permission: 'PAYMENTS_CREATE' }), {} as any);
      expect(allowed).toBe(true);

      const denied = rassiniPermissionGuard(createSnapshot({ permission: 'USER_DELETE' }), {} as any);
      expect(denied).toBe(false);
    });
  });

  it('3. rassiniBusinessUnitGuard - valida pertenencia o hasAllBusinessUnits', () => {
    authService.businessUnits.set([{ id: 1, code: 'BU_MEX', name: 'Mexico' }]);
    authService.hasAllBusinessUnits.set(false);

    (injector as any).runInContext(() => {
      const allowed = rassiniBusinessUnitGuard(createSnapshot({ businessUnit: 'BU_MEX' }), {} as any);
      expect(allowed).toBe(true);

      const denied = rassiniBusinessUnitGuard(createSnapshot({ businessUnit: 'BU_BRAZIL' }), {} as any);
      expect(denied).toBe(false);

      // Si tiene hasAllBusinessUnits = true
      authService.hasAllBusinessUnits.set(true);
      const superAllowed = rassiniBusinessUnitGuard(createSnapshot({ businessUnit: 'BU_BRAZIL' }), {} as any);
      expect(superAllowed).toBe(true);
    });
  });
});
