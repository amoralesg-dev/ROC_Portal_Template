import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { RassiniMenuItem } from '../../models';

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

                @for (group of menu; track group.label) {

                    <li class="rui-menu-group">

                        <div class="rui-menu-group-title">
                            {{ group.label }}
                        </div>

                        @if (group.items) {

                            <ul>

                                @for (item of group.items; track item.label) {

                                    <li>

                                        @if (!isInternalNavigation(item)) {

                                            <a
                                                [href]="sanitizeUrl(item.resolvedUrl || item.externalUrl || item.url)"
                                                [attr.target]="getTarget(item)"
                                                rel="noopener noreferrer"
                                                (click)="onItemClick(item, $event)">

                                                <i
                                                    [class]="item.icon">
                                                </i>

                                                <span>
                                                    {{ item.label }}
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
                                                    {{ item.label }}
                                                </span>

                                            </a>

                                        }

                                        @if (item.items && item.items.length > 0) {

                                            <ul class="rui-submenu">

                                                @for (subItem of item.items; track subItem.label) {

                                                    <li>

                                                        @if (!isInternalNavigation(subItem)) {

                                                            <a
                                                                [href]="sanitizeUrl(subItem.resolvedUrl || subItem.externalUrl || subItem.url)"
                                                                [attr.target]="getTarget(subItem)"
                                                                rel="noopener noreferrer"
                                                                (click)="onItemClick(subItem, $event)">

                                                                <i [class]="subItem.icon"></i>
                                                                <span>{{ subItem.label }}</span>
                                                            </a>

                                                        } @else {

                                                            <a
                                                                [routerLink]="getInternalRoute(subItem)"
                                                                routerLinkActive="active"
                                                                (click)="onItemClick(subItem, $event)">

                                                                <i [class]="subItem.icon"></i>
                                                                <span>{{ subItem.label }}</span>
                                                            </a>

                                                        }

                                                    </li>

                                                }

                                            </ul>

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

    private readonly router = inject(Router, { optional: true });

    @Input()
    menu: RassiniMenuItem[] = [];

    @Input()
    visible = true;

    @Output()
    itemClick = new EventEmitter<void>();

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
     * Determina si una URL pertenece al mismo origen (host y puerto) de la aplicación actual.
     */
    isCurrentAppUrl(url?: string | null): boolean {
        if (!url || typeof url !== 'string') return false;
        if (typeof window === 'undefined' || !window.location) return false;
        try {
            if (url.startsWith('/') && !url.startsWith('//')) {
                return true;
            }
            const parsed = new URL(url, window.location.origin);
            return parsed.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    /**
     * Determina si el ítem debe navegar internamente con Angular Router:
     * 1. Prioridad absoluta a routerLink si está presente.
     * 2. Si targetType no es EXTERNO.
     * 3. Si externalUrl o url coincide con el origin actual (window.location.origin).
     * IMPORTANTE: NUNCA usar resolvedUrl para determinar navegación interna,
     * ya que resolvedUrl apunta al flujo SSO (/oauth2/authorize).
     */
    isInternalNavigation(item?: RassiniMenuItem | null): boolean {
        if (!item) return false;
        if (item.routerLink) {
            return true;
        }
        if (item.targetType !== 'EXTERNO') {
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

        // Caso 2: Lanzamiento de aplicación externa (otro host/puerto)
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const rawUrl = item.resolvedUrl || item.externalUrl || item.url;
        const safeUrl = this.sanitizeUrl(rawUrl);
        if (safeUrl && safeUrl !== '#') {
            if (this.isCorporateApp(item)) {
                // Ecosistema corporativo Rassini: transición continua en la misma pestaña (_self)
                window.location.href = safeUrl;
            } else {
                // Sitios externos de terceros: nueva pestaña (_blank)
                const targetWindow = this.getTarget(item);
                window.open(safeUrl, targetWindow, 'noopener,noreferrer');
            }
        }
        this.itemClick.emit();
    }

}
