# Troubleshooting (Resolución de Problemas)

Listado oficial de problemas comunes al instalar o configurar `@rassini/rassini-ui`.

### 1. El Login hace submit pero se queda en "Cargando..." infinito
**Causa:** El endpoint `/api/v1/auth/login` definido en tu `app.config.ts` no responde o no está disponible por problemas de CORS.
**Solución:** Revisa la pestaña *Network* (Red) del navegador. Verifica que la URL base coincida con tu backend real. `<rui-login>` espera una respuesta antes de liberar el spinner.

### 2. Recibir un error "401" o "403" en el Login
**Causa:** El backend devolvió un error HTTP nativo. 
**Solución:** `<rui-login>` atrapará este error automáticamente y renderizará "Usuario o contraseña incorrectos" o "Tu usuario está deshabilitado".

### 3. Al apretar F5 (refrescar) la sesión desaparece y expulsa al usuario
**Causa:** No estás inyectando `provideRassiniAuth(config)` en los providers.
**Solución:** Agrega `provideRassiniAuth` en tu `app.config.ts`. Este provee el `APP_INITIALIZER` encargado de ejecutar silenciosamente `/auth/me` para resucitar tus Signals de la memoria volátil usando el token almacenado en tu LocalStorage.

### 4. Recibir 403 al invocar `/auth/me` (Restore Session fallido)
**Causa:** El interceptor de la librería no está anexando el token o el token expiró.
**Solución:** Revisa que tu `app.config.ts` contenga `provideHttpClient(withInterceptors([authInterceptor]))`.

### 5. Doble Login (Se intenta redirigir dos veces a `/`)
**Causa:** El consumidor programó manualmente `this.auth.login()` o `this.router.navigate(['/'])` capturando el `(loginEvent)` de `<rui-login>`.
**Solución:** Borra la llamada HTTP manual de tu controlador. `rui-login` gestiona el request y la redirección automáticamente.

### 6. El Sidebar muestra carpetas infinitas pero ningún enlace es clickeable
**Causa:** El backend envió los objetos JSON sin la propiedad correcta `route` o usando strings vacías (`""`) en lugar de `null` para los agrupadores (padres).
**Solución:** Una carpeta no-clickeable debe venir estrictamente con `"route": null`. Un link navegable debe tener `"route": "/path"`.

### 7. Dashboard raíz no navegable o Guards "Invertidos"
**Causa:** Estás protegiendo tu Dashboard con un `permissionGuard` exigiendo un permiso que no existe, o estás exigiendo permisos nulos.
**Solución:** El Dashboard general suele requerir solo estar autenticado (usa `authGuard`). Los módulos específicos (ej. Usuarios) deben usar `permissionGuard` pasándole `data: { permission: 'USER_READ' }`.

### 8. Tarball Desactualizado o Error `NG8002` (Can't bind to X...)
**Causa:** Npm reutilizó la versión anterior del tarball `.tgz` en su caché agresiva al instalar `rassini-ui`.
**Solución:** Ejecuta `npm cache clean --force` y vuelve a instalar. Revisa tu `package.json` para asegurarte que apuntas a la nueva versión (ej. 0.0.6).

### 9. El token no es visible en mi request
**Causa:** Has definido mal la variable `accessTokenStorageKey` en tu `AUTH_CONFIG`.
**Solución:** Verifica qué llave usaste y qué llave lee realmente tu backend. Por defecto la librería guarda `'accessToken'`.
