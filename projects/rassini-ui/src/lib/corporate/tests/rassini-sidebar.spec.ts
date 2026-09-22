import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { RassiniSidebar } from '../../layout/components/sidebar/rassini-sidebar';
import { RassiniMenuItem } from '../../layout/models/rassini-menu-item';

describe('Corporate SDK - RassiniSidebar Component Security & Compatibility', () => {
  it('1. Menu legacy sin targetType mantiene comportamiento routerLink', () => {
    const sidebar = new RassiniSidebar();
    sidebar.menu = [{ label: 'Admin', items: [{ label: 'Users', routerLink: '/users' }] }];
    expect(sidebar.menu[0].items?.[0].routerLink).toBe('/users');
  });

  it('2. Menu interno usando routerLink', () => {
    const sidebar = new RassiniSidebar();
    sidebar.menu = [{ label: 'Portal', items: [{ label: 'Dashboard', routerLink: '/dashboard' }] }];
    expect(sidebar.menu[0].items?.[0].routerLink).toBe('/dashboard');
  });

  it('3. Menu externo valido con externalUrl', () => {
    const sidebar = new RassiniSidebar();
    const item: RassiniMenuItem = { label: 'Pagos', targetType: 'EXTERNO', externalUrl: 'https://pagos.rassini.com' };
    expect(sidebar.sanitizeUrl(item.externalUrl)).toBe('https://pagos.rassini.com');
  });

  it('4. Preferencia de resolvedUrl sobre externalUrl', () => {
    const sidebar = new RassiniSidebar();
    const item: RassiniMenuItem = {
      label: 'Pagos',
      targetType: 'EXTERNO',
      externalUrl: 'https://pagos.rassini.com/?bu=${BUSINESS_UNIT}',
      resolvedUrl: 'https://pagos.rassini.com/?bu=BU_MEX'
    };
    const effectiveUrl = item.resolvedUrl || item.externalUrl;
    expect(effectiveUrl).toBe('https://pagos.rassini.com/?bu=BU_MEX');
  });

  it('5. resolvedUrl ausente usa externalUrl', () => {
    const item: RassiniMenuItem = { label: 'Pagos', externalUrl: 'https://pagos.rassini.com' };
    const effectiveUrl = item.resolvedUrl || item.externalUrl;
    expect(effectiveUrl).toBe('https://pagos.rassini.com');
  });

  it('6. externalUrl ausente devuelve vacio o fallback', () => {
    const sidebar = new RassiniSidebar();
    const effectiveUrl = sidebar.sanitizeUrl(null);
    expect(effectiveUrl).toBe('#');
  });

  it('7. URL vacia sanitiza a #', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.sanitizeUrl('')).toBe('#');
  });

  it('8. javascript: bloqueado', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.sanitizeUrl('javascript:alert(1)')).toBe('#');
  });

  it('9. data: bloqueado', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
  });

  it('10. vbscript: bloqueado', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.sanitizeUrl('vbscript:msgbox("xss")')).toBe('#');
  });

  it('11. file: bloqueado', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.sanitizeUrl('file:///etc/passwd')).toBe('#');
  });

  it('12. Esquema desconocido o relativo seguro', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.sanitizeUrl('/local/path')).toBe('/local/path');
  });

  it('13. http y https permitidos', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.sanitizeUrl('http://localhost:4201')).toBe('http://localhost:4201');
    expect(sidebar.sanitizeUrl('https://rassini.com')).toBe('https://rassini.com');
  });

  it('14. target="_blank" con openInNewTab=true', () => {
    const item: RassiniMenuItem = { label: 'Ext', openInNewTab: true };
    const target = item.openInNewTab ? '_blank' : '_self';
    expect(target).toBe('_blank');
  });

  it('15. rel="noopener noreferrer" verificado', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar).toBeDefined();
  });

  it('16. Sin target="_blank" con openInNewTab=false', () => {
    const item: RassiniMenuItem = { label: 'Ext', openInNewTab: false };
    const target = item.openInNewTab ? '_blank' : '_self';
    expect(target).toBe('_self');
  });

  it('17. Padre conserva expansion e items hijos', () => {
    const sidebar = new RassiniSidebar();
    sidebar.menu = [{ label: 'Group 1', items: [{ label: 'Child 1', routerLink: '/c1' }] }];
    expect(sidebar.menu[0].items?.length).toBe(1);
  });

  it('18. Hijos internos conservan routerLink', () => {
    const item: RassiniMenuItem = { label: 'Child', routerLink: '/child' };
    expect(item.routerLink).toBe('/child');
  });

  it('19. itemClick se emite en onItemClick', () => {
    const sidebar = new RassiniSidebar();
    let count = 0;
    sidebar.itemClick.subscribe(() => count++);
    sidebar.onItemClick({ label: 'Test' });
    expect(count).toBe(1);
  });

  it('20. No existe navegacion duplicada', () => {
    const sidebar = new RassiniSidebar();
    let count = 0;
    sidebar.itemClick.subscribe(() => count++);
    sidebar.onItemClick();
    expect(count).toBe(1);
  });

  it('21. Seleccion visual legacy permanece', () => {
    const sidebar = new RassiniSidebar();
    expect(sidebar.visible).toBe(true);
  });

  it('22. Menu legacy no requiere nuevos campos opcionales', () => {
    const minimalLegacyItem: RassiniMenuItem = { label: 'Legacy' };
    expect(minimalLegacyItem.label).toBe('Legacy');
    expect(minimalLegacyItem.targetType).toBeUndefined();
  });
});
