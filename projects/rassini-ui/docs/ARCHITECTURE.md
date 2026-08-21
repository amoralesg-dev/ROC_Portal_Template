# Arquitectura de la Librería @rassini/rassini-ui

Este documento explica la arquitectura técnica fundamental de la librería `@rassini/rassini-ui`. El objetivo es que cualquier desarrollador pueda entender qué responsabilidades caen en la librería, cuáles en el consumidor (el portal o app) y cómo interactúan ambas piezas con el backend.

---

## 1. Responsabilidades

### A) La Librería (`@rassini/rassini-ui`)
Provee las "piezas de Lego" reutilizables para construir un portal.
- **Componentes Visuales**: Tablas, modales, barras, loaders, layouts base (`rui-shell`).
- **Gestión de Seguridad (Auth)**: Administra el login, persistencia del JWT en LocalStorage, Signals globales y Restore Session. **Es el dueño de la persistencia**.
- **Lógica Estandarizada**: Servicios envoltura de PrimeNG (Toast, Dialog, Confirmation).

### B) La Aplicación Consumidora (Ej. `portal-minimal`)
Orquesta las piezas provistas por la librería para darles vida, aplicando la lógica de negocio y las rutas.
- **Rutas (Routing)**: Define qué pantalla levanta qué componente.
- **Guards (`permissionGuard`)**: Protege las rutas declarando `data: { permission: 'X' }`.

### C) El Contrato del Backend (IAM)
Debe exponer las APIs REST con un payload estricto. La arquitectura de IAM obedece la siguiente estructura física:

**Relaciones Relacionales:**
`Aplicación → Menú → Permiso → Rol → Usuario`

**Tablas Intermedias Clave:**
* `user_roles`: Vincula un Usuario a múltiples Roles.
* `role_permissions`: Vincula un Rol a múltiples Permisos.
* `permission_menu`: Vincula un Permiso a un Menú específico.

### D) Matriz de Responsabilidades

| Funcionalidad | Librería | Consumidor | Backend |
|--------------|-----------|------------|----------|
| Login | ✅ | ❌ | ✅ |
| JWT | ✅ | ❌ | ✅ |
| Menús | ✅ | ❌ | ✅ |
| Roles | ✅ | ❌ | ✅ |
| Permisos | ✅ | ❌ | ✅ |
| Rutas | ❌ | ✅ | ❌ |
| CRUD negocio | ❌ | ✅ | ✅ |
| Pantallas | ❌ | ✅ | ❌ |

---

## 2. El Flujo de Construcción de Menú (buildMenuTree)

El componente `<rui-sidebar>` itera de manera recursiva una estructura que el backend debe entregar por el endpoint `/auth/me`.

* **parents implícitos**: Todo menú de base de datos que sea "Raíz" (parent_id = nulo) se renderiza como un agrupador visual (Ej. IAM).
* **orderIndex**: Define el orden de visualización en pantalla de los menús (ascendente).
* **children**: Un arreglo anidado que se parsea en la UI como `items` de PrimeNG para iterar subniveles.
* **route**: Si el campo `route` contiene texto (Ej. `/usuarios`), el Sidebar inyecta un `routerLink` navegable de Angular. Si es nulo, el nodo se asume como carpeta desplegable.
* **Application ID**: `rassini-ui` puede mandar en el Login la cabecera del portal. El backend filtra el `buildMenuTree` usando el Application ID para no enviar menús de otros portales.

---

## 3. Ciclo de Vida de Seguridad

- **Login**: Invocado por `<rui-login>`. Envía credenciales. Guarda token. Llena Signals. Navega a `/`.
- **forcePasswordChange**: Si `/auth/me` del backend nota que el usuario es nuevo, puede bloquear los claims. (Flujo futuro pendiente).
- **Restore Session**: Registrado en el `APP_INITIALIZER` por la función `provideRassiniAuth`. Al presionar F5, antes de pintar la UI, extrae el token del LocalStorage e invoca silenciosamente `/auth/me` para llenar de nuevo `auth.menus()` y `auth.permissions()`.
- **Refresh**: (Opcional). Invocado por interceptores HTTP si el backend retorna 401 por expiración para canjear el `refreshToken`.
- **Logout**: Limpia todo el LocalStorage (los tokens), limpia las Signals a `null` e invoca `/auth/logout` en el servidor.
- **Layout**: El `<rui-shell>` (App Shell) vigila perpetuamente las Signals del `Auth` service para redibujar o contraer menús sin parpadear la pantalla.
