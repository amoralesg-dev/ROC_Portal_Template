# Historial de Versiones (Changelog) - @rassini/rassini-ui

Todas las versiones estables de esta librería, los cambios introducidos, las correcciones y el impacto de los mismos se documentan en este archivo.

---

## [v0.0.6] - 2026-08-21
### Added (Nuevas Funcionalidades)
- **`app-data-table`**: Incorporado el input opcional `[enableSelection]="boolean"`. 
  - Propósito: Permitir ocultar completamente la columna de checkboxes nativa en aquellos módulos que no requieren selección masiva de registros.
  - Comportamiento: Si se omite, su valor por defecto es `true`, manteniendo la columna de selección visible (compatibilidad hacia atrás). Si se asigna en `false`, la columna desaparece y el layout se expande (Colspan) adecuadamente.

### Fixed (Correcciones de Errores)
- **`app-data-table`**: Corregido el espaciado y ajuste estético del `emptymessage` (estado vacío) para que sume o reste dinámicamente columnas de *colspan* dependiendo de si `enableSelection` está activo o apagado.

### Impacto y Retrocompatibilidad
- **Totalmente retrocompatible.** Cualquier pantalla o aplicación que estuviera utilizando `<app-data-table>` con selección múltiple no presentará errores ni roturas visuales al actualizar a la versión `v0.0.6`.

---

## [v0.0.5] - Fechas Previas
### Added
- Core base de la librería (Servicios Toast, Loader, Dialog, Data Table con selección obligatoria, Page Layout base).
- Configuración base estructural extraída de Sakai-ng.
