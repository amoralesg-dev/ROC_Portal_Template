import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppFooter } from './app.footer';
import { LayoutService } from '@/app/layout/service/layout.service';
import {
  AppToast,
  AppConfirmDialog,
  AppLoader,
  Auth,
  RassiniShell
} from 'rassini-ui';
import { Router } from '@angular/router';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RassiniShell, RouterModule, AppFooter, AppToast,AppConfirmDialog, AppLoader],
    template: `<div class="layout-wrapper" [ngClass]="containerClass()">
        <rui-shell
            [menu]="menu"
            (sidebarVisibleChange)="sidebarVisible = $event"
            (logout)="onLogout()">
        </rui-shell>
        <div class="layout-main-container"
             [class.rui-main-expanded]="!sidebarVisible">
            <div class="layout-main">
                <app-app-loader></app-app-loader>
                <app-app-toast></app-app-toast>
                <app-app-confirm-dialog></app-app-confirm-dialog>
                <router-outlet></router-outlet>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask"></div>
    </div> `
})
export class AppLayout {
    layoutService = inject(LayoutService);
    private router = inject(Router);
    private auth = inject(Auth);

    sidebarVisible = true;

    toggleSidebar(): void {
        this.sidebarVisible = !this.sidebarVisible;
    }

    onLogout(): void {

        this.auth.logout();

        this.router.navigate([
            '/auth/login'
        ]);

    }

    

    constructor() {
        effect(() => {
            const state = this.layoutService.layoutState();
            if (state.mobileMenuActive) {
                document.body.classList.add('blocked-scroll');
            } else {
                document.body.classList.remove('blocked-scroll');
            }
        });
    }

    containerClass = computed(() => {

    const config = this.layoutService.layoutConfig();
    const state = this.layoutService.layoutState();

    return {
        'layout-overlay': config.menuMode === 'overlay',
        'layout-static': config.menuMode === 'static',
        'layout-static-inactive': !this.sidebarVisible,
        'layout-overlay-active': state.overlayMenuActive,
        'layout-mobile-active': state.mobileMenuActive
    };
});
    

    menu = [
        {
            label: 'Principal',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-home',
                    routerLink: '/'
                }
            ]
        },
        {
            label: 'Operación',
            items: [
                {
                    label: 'Usuarios',
                    icon: 'pi pi-users',
                    routerLink: '/usuarios'
                },
                {
                    label: 'Pagos',
                    icon: 'pi pi-credit-card',
                    routerLink: '/pagos'
                }
            ]
        }
    ];
}
