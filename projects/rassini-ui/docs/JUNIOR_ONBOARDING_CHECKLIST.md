# Lista de Verificación (Checklist) para Onboarding Junior

Si eres un desarrollador nuevo integrándote al ecosistema de **rassini-ui**, repasa este checklist antes de escribir tu primera línea de código de negocio. 

- [ ] ¿Leíste el **QUICK_START.md** y comprendes por qué no debes crear un `AuthService` local manual?
- [ ] ¿Instalaste tu tarball de la librería y tus dependencias `primeng` compatibles?
- [ ] ¿Registraste `provideRassiniAuth` en tu `app.config.ts` proveyendo los endpoints reales?
- [ ] ¿Entiendes que `<rui-login>` se suscribe solo y navega a `/` tras un login exitoso, sin que toques el archivo `.ts`?
- [ ] ¿Sabes que las rutas protegidas deben llevar obligatoriamente `data: { permission: 'MI_PERMISO' }` para que `permissionGuard` funcione?
- [ ] ¿Comprendes que apretar F5 elimina la sesión local en memoria, pero el `APP_INITIALIZER` la recarga transparente leyendo el JWT de `localStorage`?
- [ ] ¿Agregaste `<app-app-toast>` en tu Layout para que `ToastService` pueda renderizarse?
- [ ] ¿Pudiste pintar una tabla utilizando `<app-data-table>` importándolo desde la librería?
- [ ] ¿Sabes que el JSON del árbol de menús llega por el endpoint `/auth/me` del IAM backend y alimenta al `<rui-sidebar>`?
- [ ] ¿Corriste `npm run build` para asegurar que tu enrutador y dependencias cumplen con AOT (Ahead of Time)?

Si marcaste todo con "Sí", ¡estás certificado para trabajar en el Portal!
