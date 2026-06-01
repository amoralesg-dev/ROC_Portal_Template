import {Component,OnInit,ChangeDetectorRef} from '@angular/core';
import {
  PageHeaderComponent,
  PageToolbarComponent,
  PageContentComponent,
  DataTable,
  AppDialog,
  Toast,
  Loader
} from 'rassini-ui';
import { UsuarioForm } from '../../components/usuario-form/usuario-form';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-usuarios',
  imports: [PageHeaderComponent,
    PageToolbarComponent,
    PageContentComponent,
    ButtonModule,
    DataTable,
    AppDialog,
    UsuarioForm],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {

  loading = true;
  dialogVisible = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    //private readonly toast: Toast,
    private readonly confirmationService: ConfirmationService,
    private readonly loader: Loader
) {}

showDialog(): void {

      this.dialogVisible = true;

  }

  guardarUsuario(usuario: any): void {

    console.log(usuario);

    this.dialogVisible = false;

}


ngOnInit(): void {

    setTimeout(() => {

        this.loading = false;

        this.cdr.detectChanges();

    }, 3000);

}
probarLoader(): void {

    this.loader.show();

    setTimeout(() => {

        this.loader.hide();

    }, 3000);

}
probarToast(): void {

    this.toast.success('Toast funcionando');

}

probarConfirm(): void {

    this.confirmationService.confirm({
        header: 'Eliminar Usuario',
        message: '¿Desea eliminar el usuario seleccionado?',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',

        acceptButtonProps: {
            severity: 'danger'
        },

        rejectButtonProps: {
            severity: 'secondary'
        },

        accept: () => {

            this.toast.success('Usuario eliminado');

        }
    });

}


  columns = [
    { field: 'id', header: 'ID',sortable: true },
    { field: 'nombre', header: 'Nombre',sortable: true },
    { field: 'correo', header: 'Correo',sortable: true },
    { field: 'rol', header: 'Rol',sortable: true },
    { field: 'actions', header: 'Acciones', type: 'actions' as const }
  ];

usuarios = [
    {
        id: 1,
        nombre: 'Juan Pérez',
        correo: 'juan.perez@example.com',
        rol: 'Administrador'
    },
    {
        id: 2,
        nombre: 'María López',
        correo: 'maria.lopez@example.com',
        rol: 'Usuario'
    },
    {
        id: 3,
        nombre: 'Carlos García',
        correo: 'carlos.garcia@example.com',
        rol: 'Moderador'
    },
    {
        id: 4,
        nombre: 'Ana Torres',
        correo: 'ana.torres@example.com',
        rol: 'Usuario'
    },
    {
        id: 5,
        nombre: 'Ana Torres 5',
        correo: 'ana.torres5@example.com',
        rol: 'Usuario'
    }
];

}
