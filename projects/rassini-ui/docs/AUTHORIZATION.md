# Autorización y Control de Acceso - @rassini/rassini-ui

La autorización dictamina a qué pantallas y a qué botones tiene acceso un usuario autenticado basándose en permisos granulares (ej. `USER_READ`) o el rol global `IAM_ADMIN`.

## 1. El Servicio `Auth` (Verificación de Permisos)

El servicio nativo `Auth` mantiene un arreglo en memoria (Signals) con los códigos de permisos recibidos en `/auth/me`. 

Para verificar si un usuario tiene un permiso específico (o es administrador maestro):
```typescript
import { inject } from '@angular/core';
import { Auth } from '@rassini/rassini-ui';

// Dentro de un componente:
const auth = inject(Auth);
const canUpdateUser = auth.permissions().includes('USER_UPDATE') || auth.permissions().includes('IAM_ADMIN');
```

## 2. Guardias de Rutas (`permissionGuard`)

La librería exporta el `permissionGuard` para bloquear la navegación a módulos enteros por URL.
Este Guard asume que declararás la propiedad **`permission`** dentro de la metadata de la ruta (`data`).

**Firma Pública Real en Angular Router:**
```typescript
import { permissionGuard } from '@rassini/rassini-ui';

export const routes: Routes = [
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [permissionGuard],
    data: { permission: 'USER_READ' } // <-- Nombre de campo obligatorio para la librería
  }
];
```

*Nota: Internamente, `permissionGuard` concederá acceso si el arreglo de permisos incluye `'USER_READ'` o el super-rol `'IAM_ADMIN'`.*

## 3. Autorización Granular en HTML (Botones y Acciones)

Para inyectar seguridad en la UI y evitar renderizar acciones prohibidas, se utiliza la directiva estructural `@if` vinculada a la Signal de `auth.permissions()`.

**Ejemplo dentro de `<app-data-table>`:**
```html
<ng-template #actions let-row>
    @if (auth.permissions().includes('ROLE_UPDATE') || auth.permissions().includes('IAM_ADMIN')) {
        <button pButton icon="pi pi-pencil" label="Editar"></button>
    }
</ng-template>
```

## 4. Catálogo Oficial de Permisos (Ejemplo Real IAM)

En un portal integrado con el backend oficial IAM de Rassini, los permisos base esperados son:

* `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`
* `ROLE_READ`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`
* `PERMISSION_READ`, `PERMISSION_CREATE`, `PERMISSION_UPDATE`, `PERMISSION_DELETE`
* `MENU_READ`, `MENU_CREATE`, `MENU_UPDATE`, `MENU_DELETE`
* `APPLICATION_READ`, `APPLICATION_CREATE`, `APPLICATION_UPDATE`, `APPLICATION_DELETE`
* `IAM_ADMIN` (Permiso Maestro Absoluto)

No intentes utilizar prefijos extraños como `CAN_READ_USER`. La convención es rígida (`[ENTIDAD]_[ACCIÓN]`).
