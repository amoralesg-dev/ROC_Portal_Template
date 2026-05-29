import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
    {
        label: 'Principal',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-home',
                routerLink: ['/']
            }
        ]
    },
    {
        label: 'Operación',
        items: [
            {
                label: 'Usuarios',
                icon: 'pi pi-users',
                routerLink: ['/usuarios']
            },
            {
                label: 'Pagos',
                icon: 'pi pi-credit-card',
                routerLink: ['/pagos']
            },
            {
                label: 'Reportes',
                icon: 'pi pi-chart-bar',
                routerLink: ['/reportes']
            }
        ]
    },
    {
        label: 'Administración',
        items: [
            {
                label: 'Monitoreo',
                icon: 'pi pi-desktop',
                routerLink: ['/monitoreo']
            },
            {
                label: 'Configuración',
                icon: 'pi pi-cog',
                routerLink: ['/configuracion']
            }
        ]
    }
];
    }
}
