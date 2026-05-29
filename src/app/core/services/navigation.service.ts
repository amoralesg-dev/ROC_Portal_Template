import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {

    getMenu(): MenuItem[] {
        return [
            {
                label: 'Principal Main',
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