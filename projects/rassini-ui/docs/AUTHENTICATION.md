# Autenticación y Flujo de Sesión - @rassini/rassini-ui

La librería centraliza y maneja al 100% la seguridad. No se requiere (ni se recomienda) crear un `AuthService` personalizado en el proyecto consumidor, ya que la librería exporta su propio servicio reactivo `Auth`.

## 1. Configuración de Sesión y Endpoints

Existen dos enfoques para registrar las configuraciones de la librería:

### Enfoque Recomendado (Manejo Automático)
Utilizar la función `provideRassiniAuth` en el `app.config.ts`. Este método inyecta automáticamente el inicializador (APP_INITIALIZER) que se encarga de restaurar la sesión cuando el usuario refresca la página (F5).

```typescript
import { provideRassiniAuth } from '@rassini/rassini-ui';

export const appConfig: ApplicationConfig = {
  providers: [
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

### Enfoque Avanzado (Manejo Manual)
Inyectar el token `AUTH_CONFIG` manualmente. *Atención*: Si usas este método, la librería no proveerá el `APP_INITIALIZER` por ti. Quedarás a cargo de ejecutar `auth.restoreSession()` explícitamente en el inicio de tu portal.

```typescript
import { AUTH_CONFIG } from '@rassini/rassini-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: AUTH_CONFIG,
      useValue: { ... }
    }
  ]
};
```

## 2. Dónde vive la Información y los Tokens

### Tokens (Implementación Actual)
Al invocar `Auth.login()`, si el backend responde con un token, el servicio lo guarda automáticamente en el `localStorage` usando la llave definida en `accessTokenStorageKey` (usualmente `'accessToken'`).

*Recomendación Futura de Seguridad:* 
Actualmente el token vive en LocalStorage y es anexado en cada request por el `AuthInterceptor`. En un futuro, el backend debería migrar a *Cookies HttpOnly*, lo cual hará que la UI no necesite guardar el token físicamente, delegando el transporte de credenciales al navegador.

### Sesión y Permisos (Signals)
La información del usuario no persiste en el disco. Vive efímeramente en memoria mediante *Signals* expuestas en el servicio `Auth`:
- `auth.currentUser()`
- `auth.roles()`
- `auth.permissions()`
- `auth.menus()`

## 3. Restaurar Sesión (F5 o Recarga de Página)

Dado que las Signals se borran al recargar la página (F5), la aplicación consumidora debe restaurar el contexto global de inmediato. Esto se logra usualmente en el inicializador de la app o interceptando el Layout.

```typescript
// Ejecutar esto durante la carga inicial si auth.isAuthenticated() es true:
this.auth.restoreSession().subscribe();
```
El método `restoreSession()` disparará silenciosamente un GET a `/api/v1/auth/me` con el token que sobrevivió en el LocalStorage, volviendo a llenar las Signals con los permisos y menús frescos.

## 4. El Cierre de Sesión (Logout)

El servicio provee el método `auth.logout()`. Su ejecución hace lo siguiente de forma obligatoria:
1. Limpia todo el `localStorage` y `sessionStorage`.
2. Resetea las *Signals* (`currentUser`, `roles`, `permissions`, `menus`) a null o arrays vacíos.
3. Si `logoutUrl` está configurado en `AUTH_CONFIG`, dispara un POST al backend para invalidar la sesión del lado del servidor.
