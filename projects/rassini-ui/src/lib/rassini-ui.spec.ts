import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import * as PublicApi from '../public-api';

describe('RassiniUi - Public API and Library Entrypoint', () => {
  it('1. Debe exportar todos los servicios corporativos OIDC', () => {
    expect(PublicApi.AuthenticationService).toBeDefined();
    expect(PublicApi.NavigationService).toBeDefined();
    expect(PublicApi.ContextService).toBeDefined();
    expect(PublicApi.SessionBootstrapService).toBeDefined();
    expect(PublicApi.HttpNavigationAdapter).toBeDefined();
    expect(PublicApi.NAVIGATION_ADAPTER).toBeDefined();
    expect(PublicApi.provideRassiniCorporate).toBeDefined();
  });

  it('2. Debe exportar todos los componentes de layout y modelos', () => {
    expect(PublicApi.RassiniSidebar).toBeDefined();
    expect(PublicApi.RassiniTopbar).toBeDefined();
    expect(PublicApi.RassiniShell).toBeDefined();
  });

  it('3. Debe exportar todos los servicios y providers Legacy', () => {
    expect(PublicApi.Auth).toBeDefined();
    expect(PublicApi.provideRassiniAuth).toBeDefined();
    expect(PublicApi.AUTH_CONFIG).toBeDefined();
  });

  it('4. Debe exportar las directivas y guards corporativos', () => {
    expect(PublicApi.rassiniAuthGuard).toBeDefined();
    expect(PublicApi.rassiniRoleGuard).toBeDefined();
    expect(PublicApi.rassiniPermissionGuard).toBeDefined();
    expect(PublicApi.rassiniBusinessUnitGuard).toBeDefined();
    expect(PublicApi.RassiniHasRoleDirective).toBeDefined();
    expect(PublicApi.RassiniHasPermissionDirective).toBeDefined();
    expect(PublicApi.RassiniHasBusinessUnitDirective).toBeDefined();
  });
});
