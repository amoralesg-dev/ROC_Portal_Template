# Guía de Instalación y Configuración - @rassini/rassini-ui

Esta guía detalla los pasos necesarios para integrar la librería corporativa `@rassini/rassini-ui` en cualquier proyecto frontend basado en Angular.

## 1. Instalación vía npm

Actualmente la librería se distribuye como un paquete local comprimido (tarball `.tgz`). 

```bash
npm install ./ruta/a/rassini-rassini-ui-0.0.6.tgz
```

## 2. Configuración Completa en `app.config.ts`

La arquitectura vigente expone una función maestra llamada `provideRassiniAuth(config)` que se encarga de:
- Inicializar el estado de sesión y menús (APP_INITIALIZER).
- Proveer el token de inyección `AUTH_CONFIG`.
- Administrar el almacenamiento en `localStorage`.

**Ejemplo de configuración mínima completa (`src/app/app.config.ts`):**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { provideRassiniAuth, authInterceptor } from '@rassini/rassini-ui';
import { MessageService, ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    // Inyecta el interceptor de la librería para añadir Authorization: Bearer <token>
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService,
    ConfirmationService,
    // Autoconfigura todo el ciclo de vida del Login y Restore Session (F5)
    provideRassiniAuth({
      loginUrl: '/api/v1/auth/login',
      meUrl: '/api/v1/auth/me',
      refreshUrl: '/api/v1/auth/refresh',
      logoutUrl: '/api/v1/auth/logout',
      accessTokenStorageKey: 'accessToken',
      refreshTokenStorageKey: 'refreshToken'
    })
  ]
};
```

## 3. Configuración de Estilos (angular.json)

Asegúrate de incluir los temas de PrimeNG y de rassini-ui:

```json
"styles": [
  "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeicons/primeicons.css",
  "src/styles.scss"
]
```

---

Para un tutorial lineal desde cero y con comandos completos, visita **[QUICK_START.md](./QUICK_START.md)**.
