# QUICK START - Guía Lineal de Cero a Portal

Sigue esta guía secuencial para levantar un portal 100% protegido e integrado con `rassini-ui` sin tener que abrir su código fuente.

## 1. Crear el Proyecto Angular e Instalar la Librería

```bash
ng new portal-minimal --standalone
cd portal-minimal

# Instalar el tarball local provisto por plataforma
npm install ../ruta-a/rassini-rassini-ui-0.0.6.tgz

# Instalar peerDependencies requeridas
npm install primeng primeicons
```

## 2. Configurar Estilos (angular.json)

Busca el nodo `styles` de tu aplicación y asegúrate de cargar PrimeNG y la librería:

```json
"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css",
  "src/styles.scss"
]
```

## 3. Inyectar Providers Globales (src/app/app.config.ts)

Aquí ocurre la magia principal. La librería exporta la función `provideRassiniAuth` la cual inyecta el `AUTH_CONFIG` y además crea un `APP_INITIALIZER` para ejecutar automáticamente `restoreSession()` cada vez que el usuario hace F5.

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { provideRassiniAuth, authInterceptor } from '@rassini/rassini-ui';
import { MessageService, ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    ConfirmationService,
    provideRassiniAuth({
      loginUrl: 'http://localhost:8080/api/v1/auth/login',
      meUrl: 'http://localhost:8080/api/v1/auth/me',
      refreshUrl: 'http://localhost:8080/api/v1/auth/refresh',
      logoutUrl: 'http://localhost:8080/api/v1/auth/logout',
      accessTokenStorageKey: 'accessToken',
      refreshTokenStorageKey: 'refreshToken'
    })
  ]
};
```

## 4. Crear el Componente de Login (src/app/login.ts)

El login inteligente inyecta el servicio nativo de `Auth` y dispara la petición.

```typescript
import { Component } from '@angular/core';
import { RassiniLogin } from '@rassini/rassini-ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RassiniLogin],
  template: `<rui-login applicationName="Mi Portal"></rui-login>`
})
export class Login {}
```

## 5. Crear el Layout Protegido (src/app/layout.ts)

```typescript
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth, RassiniShell, AppToast, AppConfirmDialog } from '@rassini/rassini-ui';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RassiniShell, AppToast, AppConfirmDialog],
  template: `
    <app-app-toast></app-app-toast>
    <app-app-confirm-dialog></app-app-confirm-dialog>

    <rui-shell 
      [menu]="auth.menus()" 
      (logout)="auth.logout()">
      <router-outlet></router-outlet>
    </rui-shell>
  `
})
export class Layout {
  auth = inject(Auth);
}
```

## 6. Proteger las Rutas (src/app/app.routes.ts)

Para proteger una vista por permisos específicos (ej. CRUD de usuarios), usa la propiedad `permission`.

```typescript
import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from '@rassini/rassini-ui';
import { Login } from './login';
import { Layout } from './layout';

export const routes: Routes = [
  { path: 'auth/login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard').then(m => m.Dashboard)
      },
      {
        path: 'usuarios',
        canActivate: [permissionGuard],
        data: { permission: 'USER_READ' }, // <-- Uso exacto de la API real
        loadComponent: () => import('./usuarios').then(m => m.Usuarios)
      }
    ]
  }
];
```

## 7. Ejecutar y Compilar

```bash
npm run start
```

**Validaciones de Éxito:**
1. **Login:** Al hacer submit, `<rui-login>` recibe 200 OK y navega a `/`.
2. **F5 / Recarga:** Angular levanta el `APP_INITIALIZER` de `provideRassiniAuth`, lanza la petición GET a `/me` y restaura tu sesión global.
3. **Guardias:** Entrar a `/usuarios` invoca `permissionGuard`, quien revisará internamente si `USER_READ` o `IAM_ADMIN` existen en la Signal `auth.permissions()`.
