# Estrategia de Versionamiento y Guía de Migración - @rassini/rassini-ui

## 1. Estrategia de Versionamiento

El mantenimiento de `@rassini/rassini-ui` sigue la filosofía oficial de **Semantic Versioning (SemVer) - MAJOR.MINOR.PATCH**.

* **PATCH (x.x.PATCH):** 
  Se incrementa cuando se resuelven bugs, errores de renderizado o se realizan ajustes internos de performance y seguridad. 
  *Ejemplo: El botón no reaccionaba al click.*
* **MINOR (x.MINOR.x):** 
  Se incrementa cuando se añaden **nuevas funcionalidades de manera retrocompatible** (sin afectar desarrollos previos).
  *Ejemplo: Añadir un Input opcional nuevo (como ocurrió con `enableSelection` en v0.0.6).*
* **MAJOR (MAJOR.x.x):** 
  Se incrementa cuando se introducen **cambios que rompen la compatibilidad (Breaking Changes)**.
  *Ejemplo: Cambiar el nombre de un Input, eliminar un componente, o actualizar agresivamente la versión subyacente de Angular / PrimeNG.*

---

## 2. Estrategia y Proceso de Release (Generar un empaquetado)

Para lanzar una nueva versión de la librería hacia la empresa, se deben seguir estrictamente estos pasos:

1. **Version Bump:** En `C:\workspace\sakai-ng\projects\rassini-ui\package.json`, incrementar la versión según SemVer.
2. **CHANGELOG:** Documentar los cambios explícitamente en el archivo `docs/CHANGELOG.md`.
3. **Build Validation:** En la raíz del Workspace (`C:\workspace\sakai-ng`), ejecutar `npm run build` (o `ng build rassini-ui`) para compilar los binarios (`.mjs` y `.d.ts`).
4. **NPM Pack:** Navegar al output compilado (`cd dist/rassini-ui`) y ejecutar `npm pack`. Esto generará un tarball oficial (ej. `rassini-rassini-ui-1.0.0.tgz`).
5. **Git Tag (Recomendado):** Comitear el cambio en Git bajo el tag de la versión `git tag -a v1.0.0 -m "Release v1.0.0"`.
6. **Distribución:** Entregar el `.tgz` a los equipos de producto o subirlo a un registry privado corporativo (ej. Nexus, Artifactory) si estuviese disponible en un futuro.

---

## 3. Recomendaciones y Flujo para Consumidores (Aplicaciones Client)

Al instalar una actualización de la librería (Ej. Pasar de `0.0.5` a `0.0.6`), el cliente debe:

1. Copiar el nuevo `.tgz` al directorio de tu frontend y sustituir el path en tu `package.json`.
2. Ejecutar `npm install`.
3. Ejecutar inmediatamente `npm run build` en tu entorno local para certificar que ningún cambio haya introducido errores de compilación.

---

## 4. Troubleshooting: Caché de NPM (NG8002)

Ocasionalmente, npm reutiliza de manera agresiva tarballs antiguos. Si experimentas errores de "*Can't bind to X*" (Ej. NG8002) justo después de actualizar la librería, solo entonces debes recurrir a limpiar la caché forzosamente:

```bash
npm cache clean --force
npm install
```

---

## 5. Cambios Incompatibles Recientes y Migraciones

Actualmente nos encontramos en una etapa temprana de la librería (v0.x.x) y **no hay cambios que requieran una migración profunda.**

* **Para migrar de 0.0.5 a 0.0.6:** El cambio es 100% compatible. No se requiere intervención manual de código, salvo si se desea usar explícitamente la propiedad `[enableSelection]="false"` en las vistas de tabla.
