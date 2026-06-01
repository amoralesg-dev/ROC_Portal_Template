# RASSINI UI

Librería corporativa de componentes reutilizables para aplicaciones Angular de RASSINI.

---

# Tecnologías

* Angular 21
* PrimeNG 21
* PrimeIcons
* TypeScript
* SCSS

---

# Objetivo

Proporcionar una base estandarizada de componentes, servicios y modelos reutilizables para acelerar el desarrollo de aplicaciones corporativas.

---

# Componentes Disponibles

## Layout

* PageHeaderComponent
* PageToolbarComponent
* PageContentComponent

## Data

* DataTable

## Dialogs

* AppDialog
* AppConfirmDialog

## Feedback

* AppToast
* AppLoader

---

# Servicios Disponibles

* Toast
* Loader
* Dialog

---

# Modelos Disponibles

* Audit
* Page
* PageRequest
* DataTableColumn

---

# Instalación

## Construir librería

```bash
ng build rassini-ui
```

## Generar paquete

```bash
npm pack ./dist/rassini-ui
```

Genera:

```txt
rassini-ui-0.0.1.tgz
```

## Instalar paquete

```bash
npm install rassini-ui-0.0.1.tgz
```

Verificar:

```json
{
  "dependencies": {
    "rassini-ui": "file:rassini-ui-0.0.1.tgz"
  }
}
```

---

# Uso

## Componentes

```ts
import {
  PageHeaderComponent,
  PageToolbarComponent,
  PageContentComponent,
  DataTable,
  AppDialog,
  AppToast,
  AppConfirmDialog,
  AppLoader
} from 'rassini-ui';
```

## Servicios

```ts
import {
  Toast,
  Loader,
  Dialog
} from 'rassini-ui';
```

```ts
constructor(
  private readonly toast: Toast,
  private readonly loader: Loader
) {}
```

---

# Configuración Global

Agregar una sola vez en el layout principal.

```html
<app-app-toast></app-app-toast>

<app-app-confirm-dialog></app-app-confirm-dialog>

<app-app-loader></app-app-loader>
```

---

# Loader

Mostrar:

```ts
this.loader.show();
```

Ocultar:

```ts
this.loader.hide();
```

Ejemplo:

```ts
this.loader.show();

setTimeout(() => {
    this.loader.hide();
}, 3000);
```

---

# Toast

Success:

```ts
this.toast.success('Registro guardado correctamente');
```

Error:

```ts
this.toast.error('Ocurrió un error');
```

Warning:

```ts
this.toast.warn('Advertencia');
```

Info:

```ts
this.toast.info('Información');
```

---

# Confirm Dialog

```ts
this.confirmationService.confirm({
    header: 'Confirmación',
    message: '¿Desea continuar?',
    accept: () => {
        this.toast.success('Operación ejecutada');
    }
});
```

---

# DataTable

Componente reutilizable para mostrar información tabular con paginación, búsqueda global y acciones personalizadas.

---

## Importación

```ts
import { DataTable } from 'rassini-ui';
```

```ts
@Component({
  imports: [
    DataTable
  ]
})
```

---

## Configuración de Columnas

```ts
columns = [
  {
    field: 'id',
    header: 'ID',
    sortable: true
  },
  {
    field: 'nombre',
    header: 'Nombre',
    sortable: true
  },
  {
    field: 'correo',
    header: 'Correo',
    sortable: true
  },
  {
    field: 'rol',
    header: 'Rol'
  },
  {
    field: 'actions',
    header: 'Acciones',
    type: 'actions'
  }
];
```

---

## Datos

```ts
usuarios = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    correo: 'juan@example.com',
    rol: 'Administrador'
  },
  {
    id: 2,
    nombre: 'María López',
    correo: 'maria@example.com',
    rol: 'Usuario'
  }
];
```

---

## Uso Básico

```html
<app-data-table
    [columns]="columns"
    [data]="usuarios">
</app-data-table>
```

---

## Uso con Paginación

```html
<app-data-table
    [columns]="columns"
    [data]="usuarios"
    [rows]="10"
    [paginator]="true">
</app-data-table>
```

---

## Uso con Loading

```html
<app-data-table
    [columns]="columns"
    [data]="usuarios"
    [loading]="loading">
</app-data-table>
```

```ts
loading = true;

setTimeout(() => {
  this.loading = false;
}, 3000);
```

---

## Uso con Búsqueda Global

```html
<app-data-table
    [columns]="columns"
    [data]="usuarios"
    [globalFilterFields]="[
      'id',
      'nombre',
      'correo',
      'rol'
    ]">
</app-data-table>
```

---

## Uso con Acciones

```html
<app-data-table
    [columns]="columns"
    [data]="usuarios">

    <ng-template #actions let-row>

        <button
            pButton
            icon="pi pi-pencil"
            severity="secondary">
        </button>

        <button
            pButton
            icon="pi pi-trash"
            severity="danger">
        </button>

    </ng-template>

</app-data-table>
```

---

## Tipo de Columnas Soportadas

### Texto

```ts
{
  field: 'nombre',
  header: 'Nombre'
}
```

### Acciones

```ts
{
  field: 'actions',
  header: 'Acciones',
  type: 'actions'
}
```

---

## Inputs Disponibles

| Input              | Tipo              | Default      |
| ------------------ | ----------------- | ------------ |
| columns            | DataTableColumn[] | []           |
| data               | any[]             | []           |
| paginator          | boolean           | true         |
| rows               | number            | 10           |
| rowsPerPageOptions | number[]          | [5,10,20,50] |
| globalFilterFields | string[]          | []           |
| loading            | boolean           | false        |

---

# Flujo de Publicación

## 1. Construir

```bash
ng build rassini-ui
```

## 2. Empaquetar

```bash
npm pack ./dist/rassini-ui
```

## 3. Instalar nueva versión

```bash
npm install rassini-ui-0.0.1.tgz
```

---

# Versionamiento

## v0.0.1

### Componentes

* PageHeaderComponent
* PageToolbarComponent
* PageContentComponent
* DataTable
* AppDialog
* AppToast
* AppConfirmDialog
* AppLoader

### Servicios

* Toast
* Loader
* Dialog

### Modelos

* Audit
* Page
* PageRequest
* DataTableColumn

---

# Roadmap

## v0.2.0

* DataTable Image Column
* DataTable Badge Column
* DataTable Currency Column
* DataTable Date Column

## v0.3.0

* Confirm Service
* Dialog Service avanzado
* Theme Service

## v1.0.0

* Publicación corporativa
* Documentación completa
* Manual de implementación
* Versionado estable

---

# Estado

✅ Librería funcional

✅ Componentes reutilizables operativos

✅ Empaquetado funcional

✅ Consumo validado en aplicación Angular

🚧 Evolución continua
