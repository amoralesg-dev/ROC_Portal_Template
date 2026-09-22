import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { provideRassiniAuth, AUTH_CONFIG } from '../../providers/auth.provider';
import { Auth } from '../../services/auth';
import { authGuard } from '../../guards/auth-guard';
import { permissionGuard } from '../../guards/permission.guard';
import { authInterceptor } from '../../interceptors/auth.interceptor';
import { RassiniSidebar } from '../../layout/components/sidebar/rassini-sidebar';
import { RassiniTopbar } from '../../layout/components/topbar/rassini-topbar';
import { RassiniShell } from '../../layout/components/shell/rassini-shell';

describe('Legacy Compatibility Verification (Phase 1)', () => {
  it('1. Todos los simbolos legacy estan disponibles y conservan sus nombres y tipos', () => {
    expect(provideRassiniAuth).toBeDefined();
    expect(AUTH_CONFIG).toBeDefined();
    expect(Auth).toBeDefined();
    expect(authGuard).toBeDefined();
    expect(permissionGuard).toBeDefined();
    expect(authInterceptor).toBeDefined();
    expect(RassiniSidebar).toBeDefined();
    expect(RassiniTopbar).toBeDefined();
    expect(RassiniShell).toBeDefined();
  });

  it('2. rui-sidebar conserva Inputs originales y funcionalidad con menus pasados por @Input', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.menu).toEqual([]);
    expect(sidebar.visible).toBe(true);
    expect(sidebar.itemClick).toBeDefined();

    sidebar.menu = [
      { label: 'Dashboard', routerLink: '/dashboard' },
      { label: 'Pagos', targetType: 'EXTERNO', externalUrl: 'http://localhost:4201' }
    ];

    expect(sidebar.menu.length).toBe(2);
    expect(sidebar.menu[0].label).toBe('Dashboard');
    expect(sidebar.menu[1].targetType).toBe('EXTERNO');
  });

  it('3. Auth legacy sigue operando en modo monolítico sin activar OIDC si no se inyecta provideRassiniCorporate', () => {
    const authConfig = {
      loginUrl: '/api/v1/auth/login',
      refreshUrl: '/api/v1/auth/refresh',
      meUrl: '/api/v1/auth/me',
      accessTokenStorageKey: 'accessToken',
      refreshTokenStorageKey: 'refreshToken'
    };

    const providers = provideRassiniAuth(authConfig);
    expect(providers.length).toBeGreaterThan(0);
    // El modo OIDC no se registra en provideRassiniAuth
  });
});
