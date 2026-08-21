# Ejemplos de Implementación y Arquitectura

Este documento describe la interacción exacta entre los componentes inteligentes de la librería, y cómo el consumidor debe utilizarlos sin re-inventar la rueda.

## 1. El Login Inteligente (`<rui-login>`)

El `<rui-login>` administra el POST a la API inyectando nativamente el servicio `Auth`, y navega a `/` tras un 200 OK.

```typescript
// src/app/pages/auth/login.ts
import { Component } from '@angular/core';
import { RassiniLogin } from '@rassini/rassini-ui';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [RassiniLogin],
    template: `
        <rui-login applicationName="Portal RRHH"></rui-login>
    `
})
export class LoginPage {
    // La librería hace el request HTTP y la redirección.
    // No requiere programar callbacks.
}
```

## 2. Layout Principal (`<rui-shell>`)

Cuando el Login navega a `/`, Angular carga el layout protegido. 

```typescript
// src/app/layout/main.component.ts
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth, RassiniShell } from '@rassini/rassini-ui';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, RassiniShell],
    template: `
        <rui-shell 
            [menu]="auth.menus()" 
            (logout)="auth.logout()">
            
            <router-outlet></router-outlet>
            
        </rui-shell>
    `
})
export class MainLayoutComponent {
    auth = inject(Auth);
}
```

## 3. Autorización y Tablas (`permissionGuard`)

En el enrutador debes utilizar la propiedad de datos `permission`.

```typescript
// app.routes.ts
import { permissionGuard } from '@rassini/rassini-ui';

export const routes: Routes = [
    {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [permissionGuard],
        data: { permission: 'USER_READ' } // Propiedad auditada obligatoria
    }
];
```

Y en tu HTML, lees las signals para mostrar u ocultar acciones ofensivas:

```typescript
// usuarios.component.ts
import { Component, inject } from '@angular/core';
import { DataTable, Auth } from '@rassini/rassini-ui';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [DataTable],
    template: `
        <app-data-table
            [columns]="columns"
            [data]="usuarios"
            [enableSelection]="false"> 
            
            <ng-template #actions let-row>
                @if (auth.permissions().includes('USER_UPDATE') || auth.permissions().includes('IAM_ADMIN')) {
                    <button pButton icon="pi pi-pencil"></button>
                }
            </ng-template>
        </app-data-table>
    `
})
export class UsuariosComponent {
    auth = inject(Auth);
    usuarios = [...];
    columns = [
        { field: 'username', header: 'Nombre' },
        { field: 'actions', header: 'Acciones', type: 'actions' }
    ];
}
```
