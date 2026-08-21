# Guía de Componentes Funcionales - @rassini/rassini-ui

Índice exhaustivo y auditado de la API pública exportada por `rassini-ui`.

## 1. rui-login (Pantalla de Autenticación)

**Selector:** `<rui-login>`
**Responsabilidad (Librería):** Es un "Smart Component". No solo pinta el formulario, sino que **inyecta el servicio `Auth` automáticamente**. Al hacer clic en "Iniciar Sesión", este componente:
1. Se auto-bloquea (`loading = true`).
2. Ejecuta `auth.login(username, password)`.
3. Si falla, intercepta el error HTTP (401, 403, 500) e imprime mensajes genéricos en pantalla.
4. Si tiene éxito, **navega automáticamente hacia `/`**.

**Inputs:**
* `title`, `subtitle`, `applicationName`, `loginButtonText` - Personalización visual.
**Outputs:**
* `loginEvent` - Emitido al momento del submit (útil solo si deseas ejecutar lógicas secundarias, ya que el request HTTP ya está controlado por la librería).

**Implementación Actual Recomendada (Cero Boilerplate):**
```html
<!-- La app consumidora no necesita programar la petición HTTP -->
<rui-login applicationName="Portal RRHH"></rui-login>
```

---

## 2. rui-shell (Layout Contenedor)

**Selector:** `<rui-shell>`
**Responsabilidad:** Layout dinámico, integra el sidebar, el topbar, el footer y el router-outlet.

**Inputs:**
* `menu: RassiniMenuItem[]` - Inyecta el árbol de menús JSON (usualmente `auth.menus()`).
**Outputs:**
* `logout: EventEmitter<void>` - Emitido cuando se cierra sesión desde la barra superior.
* `sidebarVisibleChange` - Notifica colapsos de menú.

```html
<rui-shell 
    [menu]="auth.menus()" 
    (logout)="auth.logout()">
    <router-outlet></router-outlet>
</rui-shell>
```

---

## 3. Data Table (app-data-table)

**Selector:** `<app-data-table>`
Grilla reutilizable conectada a PrimeNG.
* `data: any[]` - Los registros.
* `columns: DataTableColumn[]` - Definición visual.
* `enableSelection: boolean` - (Default: `true`).

---

## 4. Modales y Feedbacks

La librería envuelve y estandariza las utilidades de PrimeNG.
**Selectores Reales Publicados:**
* `<app-app-dialog>` (Modal genérico).
* `<app-app-confirm-dialog>` (Confirmaciones Sí/No globales).
* `<app-app-toast>` (Notificaciones).
* `<app-app-loader>` (Pantalla de bloqueo).

Todos los servicios emparejados (Ej. `Toast`, `Dialog`, `Loader`) son exportados en el `public-api.ts`.
