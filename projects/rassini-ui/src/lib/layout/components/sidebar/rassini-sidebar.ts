import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { RassiniMenuItem } from '../../models';
import { RassiniI18nService } from '../../../i18n';

@Component({
    selector: 'rui-sidebar',
    styleUrl: './rassini-sidebar.scss',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive
    ],
    template: `
        <aside class="rui-sidebar" [class.hidden]="!visible">

            <ul class="rui-menu">

                @for (group of menu; track (group.code || group.label)) {

                    <li class="rui-menu-group">

                        @if (hasChildren(group)) {
                            <div
                                class="rui-menu-group-title rui-menu-group-collapsible"
                                role="button"
                                tabindex="0"
                                (click)="toggleGroup(group, $event)"
                                (keydown.enter)="toggleGroup(group, $event)"
                                (keydown.space)="toggleGroup(group, $event)">
                                <span class="rui-group-label">{{ resolveLabel(group) }}</span>
                                <i
                                    class="pi pi-chevron-right rui-chevron"
                                    [class.rotated]="isGroupExpanded(group)">
                                </i>
                            </div>
                        } @else {
                            <div class="rui-menu-group-title">
                                <span class="rui-group-label">{{ resolveLabel(group) }}</span>
                            </div>
                        }

                        @if (group.items && isGroupExpanded(group)) {

                            <ul class="rui-menu-items">

                                @for (item of group.items; track (item.code || item.label)) {

                                    <li class="rui-menu-item-wrapper">

                                        @if (hasChildren(item)) {

                                            <div
                                                class="rui-parent-item"
                                                role="button"
                                                tabindex="0"
                                                (click)="toggleItem(item, $event)"
                                                (keydown.enter)="toggleItem(item, $event)"
                                                (keydown.space)="toggleItem(item, $event)">
                                                <div class="rui-item-content">
                                                    @if (item.icon) {
                                                        <i [class]="item.icon"></i>
                                                    }
                                                    <span>{{ resolveLabel(item) }}</span>
                                                </div>
                                                <i
                                                    class="pi pi-chevron-right rui-chevron"
                                                    [class.rotated]="isItemExpanded(item)">
                                                </i>
                                            </div>

                                            @if (isItemExpanded(item)) {
                                                <ul class="rui-submenu">
                                                    @for (subItem of item.items; track (subItem.code || subItem.label)) {
                                                        <li>
                                                            @if (subItem.command) {
                                                                <a
                                                                    href="javascript:void(0)"
                                                                    (click)="onItemClick(subItem, $event)">
                                                                    <i [class]="subItem.icon"></i>
                                                                    <span>{{ resolveLabel(subItem) }}</span>
                                                                </a>
                                                            } @else if (!isInternalNavigation(subItem)) {
                                                                <a
                                                                    [href]="sanitizeUrl(subItem.resolvedUrl || subItem.externalUrl || subItem.url)"
                                                                    [attr.target]="getTarget(subItem)"
                                                                    rel="noopener noreferrer"
                                                                    (click)="onItemClick(subItem, $event)">
                                                                    <i [class]="subItem.icon"></i>
                                                                    <span>{{ resolveLabel(subItem) }}</span>
                                                                </a>
                                                            } @else {
                                                                <a
                                                                    [routerLink]="getInternalRoute(subItem)"
                                                                    routerLinkActive="active"
                                                                    (click)="onItemClick(subItem, $event)">
                                                                    <i [class]="subItem.icon"></i>
                                                                    <span>{{ resolveLabel(subItem) }}</span>
                                                                </a>
                                                            }
                                                        </li>
                                                    }
                                                </ul>
                                            }

                                        } @else {

                                            @if (item.command) {

                                                <a
                                                    href="javascript:void(0)"
                                                    (click)="onItemClick(item, $event)">

                                                    <i
                                                        [class]="item.icon">
                                                    </i>

                                                    <span>
                                                        {{ resolveLabel(item) }}
                                                    </span>

                                                </a>

                                            } @else if (!isInternalNavigation(item)) {

                                                <a
                                                    [href]="sanitizeUrl(item.resolvedUrl || item.externalUrl || item.url)"
                                                    [attr.target]="getTarget(item)"
                                                    rel="noopener noreferrer"
                                                    (click)="onItemClick(item, $event)">

                                                    <i
                                                        [class]="item.icon">
                                                    </i>

                                                    <span>
                                                        {{ resolveLabel(item) }}
                                                    </span>

                                                </a>

                                            } @else {

                                                <a
                                                    [routerLink]="getInternalRoute(item)"
                                                    routerLinkActive="active"
                                                    (click)="onItemClick(item, $event)">

                                                    <i
                                                        [class]="item.icon">
                                                    </i>

                                                    <span>
                                                        {{ resolveLabel(item) }}
                                                    </span>

                                                </a>

                                            }

                                        }

                                    </li>

                                }

                            </ul>

                        }

                    </li>

                }

            </ul>

        </aside>
    `
})
export class RassiniSidebar {

    private readonly router: Router | null = null;
    readonly i18n = inject(RassiniI18nService, { optional: true });

    constructor() {
        try {
            this.router = inject(Router, { optional: true });
        } catch {
            this.router = null;
        }
    }

    resolveLabel(item?: RassiniMenuItem | null): string {
        if (!item) return '';
        if (this.i18n) {
            return this.i18n.resolveMenuLabel(item.code, item.label);
        }
        return item.label || '';
    }

    @Input()
    menu: RassiniMenuItem[] = [];

    @Input()
    visible = true;

    @Output()
    itemClick = new EventEmitter<void>();

    /**
     * Map to store explicit user toggle overrides (expanded = true / collapsed = false)
     */
    private readonly expansionOverrides = new Map<string, boolean>();

    private getItemKey(item: RassiniMenuItem): string {
        return item.code || item.label || item.routerLink?.toString() || '';
    }

    hasChildren(item?: RassiniMenuItem | null): boolean {
        return !!(item && item.items && item.items.length > 0);
    }

    isGroupExpanded(group: RassiniMenuItem): boolean {
        const key = this.getItemKey(group);
        if (this.expansionOverrides.has(key)) {
            return this.expansionOverrides.get(key) === true;
        }
        if (group.expanded !== undefined) {
            return group.expanded;
        }
        // Auto-expand if any descendant is active in current router
        if (this.isAnyChildActive(group)) {
            return true;
        }
        // By default, groups without explicit state are collapsed initially
        return false;
    }

    toggleGroup(group: RassiniMenuItem, event?: Event): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const current = this.isGroupExpanded(group);
        const key = this.getItemKey(group);
        this.expansionOverrides.set(key, !current);
    }

    isItemExpanded(item: RassiniMenuItem): boolean {
        const key = this.getItemKey(item);
        if (this.expansionOverrides.has(key)) {
            return this.expansionOverrides.get(key) === true;
        }
        if (item.expanded !== undefined) {
            return item.expanded;
        }
        // Auto-expand if any descendant is active in current router
        if (this.isAnyChildActive(item)) {
            return true;
        }
        // By default, sub-items are collapsed unless specified or active
        return false;
    }

    toggleItem(item: RassiniMenuItem, event?: Event): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const current = this.isItemExpanded(item);
        const key = this.getItemKey(item);
        this.expansionOverrides.set(key, !current);
    }

    isAnyChildActive(item: RassiniMenuItem): boolean {
        if (!item.items || item.items.length === 0) return false;
        return item.items.some(child => this.isNodeActive(child));
    }

    isNodeActive(item: RassiniMenuItem): boolean {
        if (this.router) {
            const currentUrl = this.router.url.split('?')[0].split('#')[0];
            const route = this.getInternalRoute(item);
            if (route) {
                const routeStr = (Array.isArray(route) ? route.join('/') : route).split('?')[0].split('#')[0];
                if (routeStr && (currentUrl === routeStr || currentUrl.startsWith(routeStr + '/'))) {
                    return true;
                }
            }
        }
        if (typeof window !== 'undefined' && window.location) {
            const currentPath = window.location.pathname;
            const targetUrl = item.externalUrl || item.url;
            if (targetUrl) {
                try {
                    const parsed = new URL(targetUrl, window.location.origin);
                    if (parsed.origin === window.location.origin && currentPath === parsed.pathname) {
                        return true;
                    }
                } catch {
                    // Ignore URL parse error
                }
            }
        }
        if (item.items && item.items.length > 0) {
            return this.isAnyChildActive(item);
        }
        return false;
    }

    sanitizeUrl(url?: string | null): string {
        if (!url || typeof url !== 'string') return '#';
        const trimmed = url.trim().toLowerCase();
        // Bloquear esquemas peligrosos
        if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:') || trimmed.startsWith('file:')) {
            return '#';
        }
        return url;
    }

    /**
     * Obtiene el contexto base de la aplicación actual (ej. '/employee-portal' o '/portal-cxp').
     */
    private getCurrentAppBasePath(): string {
        if (typeof document !== 'undefined') {
            const baseEl = document.querySelector('base');
            const baseHref = baseEl?.getAttribute('href')?.trim();
            if (baseHref && baseHref !== '/' && baseHref !== '.') {
                const clean = baseHref.startsWith('/') ? baseHref : `/${baseHref}`;
                return clean.endsWith('/') ? clean.slice(0, -1) : clean;
            }
        }
        if (typeof window !== 'undefined' && window.location) {
            const pathname = window.location.pathname || '/';
            const firstSegment = pathname.split('/').filter(Boolean)[0];
            if (firstSegment === 'employee-portal' || firstSegment === 'portal-cxp') {
                return `/${firstSegment}`;
            }
        }
        return '';
    }

    /**
     * Determina si una URL pertenece al mismo origen y al mismo subcontexto de la aplicación actual.
     */
    isCurrentAppUrl(url?: string | null): boolean {
        if (!url || typeof url !== 'string') return false;
        if (typeof window === 'undefined' || !window.location) return false;
        const trimmed = url.trim();
        if (trimmed.startsWith('//')) return false;
        try {
            const parsed = new URL(trimmed, window.location.origin);
            if (parsed.origin !== window.location.origin) {
                return false;
            }
            const currentBasePath = this.getCurrentAppBasePath();
            if (currentBasePath) {
                return parsed.pathname === currentBasePath || parsed.pathname.startsWith(`${currentBasePath}/`);
            }
            // Si la app actual corre en raíz '/', pero la URL apunta a otro subcontexto corporativo distinto
            if (parsed.pathname.startsWith('/portal-cxp/') || parsed.pathname === '/portal-cxp' ||
                parsed.pathname.startsWith('/employee-portal/') || parsed.pathname === '/employee-portal') {
                const currentPath = window.location.pathname || '/';
                const targetFirst = parsed.pathname.split('/').filter(Boolean)[0];
                const currentFirst = currentPath.split('/').filter(Boolean)[0];
                return targetFirst === currentFirst;
            }
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Determina si el ítem debe navegar internamente con Angular Router:
     * 1. Si el elemento tiene hijos (items), nunca navega por router (solo expande/contrae).
     * 2. Prioridad absoluta a routerLink si está presente.
     * 3. Si targetType es EXTERNO o authType es OIDC sin routerLink, NUNCA usar el Router interno de la SPA actual.
     * 4. Si targetType no es EXTERNO.
     * 5. Si externalUrl o url pertenece a la misma SPA actual (mismo origen y mismo baseHref).
     */
    isInternalNavigation(item?: RassiniMenuItem | null): boolean {
        if (!item) return false;
        if (this.hasChildren(item)) {
            return false;
        }
        if (item.routerLink) {
            return true;
        }
        if (item.targetType === 'EXTERNO' || item.authType === 'OIDC') {
            return false;
        }
        if (item.targetType && item.targetType !== 'EXTERNO') {
            return true;
        }
        const targetUrl = item.externalUrl || item.url;
        if (targetUrl && this.isCurrentAppUrl(targetUrl)) {
            return true;
        }
        return false;
    }

    /**
     * Obtiene la ruta interna normalizada para routerLink o navigateByUrl.
     */
    getInternalRoute(item?: RassiniMenuItem | null): string | any[] {
        if (!item) return '';
        if (item.routerLink) {
            return item.routerLink;
        }
        const targetUrl = item.externalUrl || item.url;
        if (targetUrl && this.isCurrentAppUrl(targetUrl)) {
            try {
                const parsed = new URL(targetUrl, window.location.origin);
                return parsed.pathname + (parsed.search || '');
            } catch {
                return targetUrl;
            }
        }
        return '';
    }

    /**
     * Determina si el ítem corresponde a una aplicación del ecosistema corporativo Rassini:
     * - Si appType es 'INTERNA' o authType es 'OIDC'
     * - O si la URL es el flujo de autorización OAuth2/OIDC (/oauth2/authorize)
     */
    isCorporateApp(item?: RassiniMenuItem | null): boolean {
        if (!item) return false;
        if (item.appType === 'INTERNA' || item.authType === 'OIDC') {
            return true;
        }
        const url = (item.resolvedUrl || item.externalUrl || item.url || '').toLowerCase();
        if (url.includes('/oauth2/authorize') || url.includes('/employee-portal')) {
            return true;
        }
        return false;
    }

    /**
     * Obtiene el target de navegación:
     * - Aplicaciones corporativas del ecosistema Rassini -> siempre '_self' (misma pestaña)
     * - Sitios externos de terceros -> '_blank' si openInNewTab es true
     */
    getTarget(item?: RassiniMenuItem | null): string {
        if (!item) return '_self';
        if (this.isCorporateApp(item)) {
            return '_self';
        }
        return (item.openInNewTab || item.target === '_blank') ? '_blank' : '_self';
    }

    onItemClick(item?: RassiniMenuItem, event?: Event): void {
        if (!item) {
            this.itemClick.emit();
            return;
        }

        // Elementos padre con hijos solo expanden/contraen el submenú, nunca inician navegación
        if (this.hasChildren(item)) {
            this.toggleItem(item, event);
            return;
        }

        if (item.command) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            item.command({ originalEvent: event, item });
            this.itemClick.emit();
            return;
        }

        // Caso 1: Navegación interna en la misma SPA
        if (this.isInternalNavigation(item)) {
            const internalRoute = this.getInternalRoute(item);
            if (internalRoute && this.router) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                const urlStr = Array.isArray(internalRoute) ? internalRoute.join('/') : internalRoute;
                this.router.navigateByUrl(urlStr);
            }
            this.itemClick.emit();
            return;
        }

        // Caso 2: Lanzamiento de aplicación externa (otro subcontexto u otro host/puerto)
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const rawUrl = item.resolvedUrl || item.externalUrl || item.url;
        const safeUrl = this.sanitizeUrl(rawUrl);
        if (safeUrl && safeUrl !== '#') {
            if (item.authType === 'OIDC' && typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('rassini_redirect_url', safeUrl);
            }
            if (this.isCorporateApp(item)) {
                // Ecosistema corporativo Rassini: transición continua en la misma pestaña (_self)
                window.location.href = safeUrl;
            } else {
                // Sitios externos de terceros: según openInNewTab / target
                const targetWindow = this.getTarget(item);
                if (targetWindow === '_blank') {
                    window.open(safeUrl, '_blank', 'noopener,noreferrer');
                } else {
                    window.location.href = safeUrl;
                }
            }
        }
        this.itemClick.emit();
    }

}
