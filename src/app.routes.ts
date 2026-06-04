import { Routes } from '@angular/router';

import { AppLayout } from './app/layout/component/app.layout';

import { Dashboard } from './app/pages/dashboard/dashboard';

import { Documentation } from './app/pages/documentation/documentation';

import { Landing } from './app/pages/landing/landing';

import { Notfound } from './app/pages/notfound/notfound';

import { Usuarios } from './app/features/usuarios/pages/usuarios/usuarios';

import { Pagos } from './app/features/pagos/pages/pagos/pagos';

import { Reportes } from './app/features/reportes/pages/reportes/reportes';

import { Monitoreo } from './app/features/monitoreo/pages/monitoreo/monitoreo';

import { Configuracion } from './app/features/configuracion/pages/configuracion/configuracion';

import { authGuard } from 'rassini-ui';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: Dashboard
            },

            {
                path: 'usuarios',
                component: Usuarios
            },

            {
                path: 'pagos',
                component: Pagos
            },

            {
                path: 'reportes',
                component: Reportes
            },

            {
                path: 'monitoreo',
                component: Monitoreo
            },

            {
                path: 'configuracion',
                component: Configuracion
            },

            {
                path: 'uikit',
                loadChildren: () =>
                    import('./app/pages/uikit/uikit.routes')
            },

            {
                path: 'documentation',
                component: Documentation
            },

            {
                path: 'pages',
                loadChildren: () =>
                    import('./app/pages/pages.routes')
            }
        ]
    },

    {
        path: 'landing',
        component: Landing
    },

    {
        path: 'notfound',
        component: Notfound
    },

    {
        path: 'auth',
        loadChildren: () =>
            import('./app/pages/auth/auth.routes')
    },

    {
        path: '**',
        redirectTo: '/notfound'
    }
];