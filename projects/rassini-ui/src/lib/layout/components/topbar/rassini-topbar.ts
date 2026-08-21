import {
    Component,
    EventEmitter,
    Output,
    inject,
    ViewChild,
    OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    RASSINI_LOGO
} from '../../../assets/rassini-assets';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { MenuItem } from 'primeng/api';
import { Auth } from '../../../services/auth';
import { ChangePasswordComponent } from '../../../components/change-password/change-password.component';

@Component({
    selector: 'rui-topbar',
    standalone: true,
    imports: [CommonModule, MenuModule, DialogModule, ChangePasswordComponent],
    template: `
        <header class="rui-topbar">

            <div class="rui-topbar-left">

                <button
                    type="button"
                    class="rui-menu-button"
                    (click)="menuToggle.emit()">

                    <i class="pi pi-bars"></i>

                </button>

                <img
                    [src]="logo"
                    alt="Rassini"
                    class="rui-logo">

            </div>

            <div class="rui-topbar-right flex align-items-center gap-3 ml-auto">

                <i class="pi pi-calendar cursor-pointer"></i>

                <i class="pi pi-inbox cursor-pointer"></i>

                <div class="rui-profile-button cursor-pointer flex align-items-center gap-2" (click)="onProfileIconClick($event)" title="{{ auth.currentUser()?.username }}">
                    <i class="pi pi-user"></i>
                    <span class="rui-profile-username text-overflow-ellipsis white-space-nowrap overflow-hidden">{{ auth.currentUser()?.username }}</span>
                </div>

                <i
                    class="pi pi-sign-out cursor-pointer"
                    (click)="testLogout()">
                </i>

            </div>

        </header>

        <!-- Modals and Overlays moved completely outside of the header to prevent any interference with Flexbox (like justify-content: space-between) -->
        <p-menu #profileMenu [model]="profileMenuItems" [popup]="true"></p-menu>
        
        <p-dialog header="Mi Perfil" [(visible)]="profileVisible" [modal]="true" [style]="{width: '400px'}" appendTo="body">
            <div class="flex flex-col gap-3" *ngIf="auth.currentUser() as user">
                <div><strong>Usuario:</strong> {{ user.username }}</div>
                <div><strong>Email:</strong> {{ user.email }}</div>
                <div><strong>Estado:</strong> {{ user.enabled ? 'Activo' : 'Inactivo' }}</div>
                <div><strong>Roles:</strong> {{ auth.roles()?.length ? auth.roles().join(', ') : 'Ninguno' }}</div>
            </div>
        </p-dialog>

        <p-dialog header="Mis Roles" [(visible)]="rolesVisible" [modal]="true" [style]="{width: '400px'}" appendTo="body">
            <ul class="list-none p-0 m-0">
                <li *ngFor="let role of auth.roles()" class="p-2 border-b">{{ role }}</li>
            </ul>
            <div *ngIf="!auth.roles()?.length" class="p-2 text-gray-500">No tienes roles asignados.</div>
        </p-dialog>

        <p-dialog header="Mis Permisos" [(visible)]="permissionsVisible" [modal]="true" [style]="{width: '400px'}" appendTo="body">
            <ul class="list-none p-0 m-0">
                <li *ngFor="let perm of auth.permissions()" class="p-2 border-b">{{ perm }}</li>
            </ul>
            <div *ngIf="!auth.permissions()?.length" class="p-2 text-gray-500">No tienes permisos asignados.</div>
        </p-dialog>

        <app-change-password #changePasswordDialog></app-change-password>
    `,
    styleUrl: './rassini-topbar.scss'
})
export class RassiniTopbar implements OnInit {

    logo = RASSINI_LOGO;

    @Output()
    menuToggle = new EventEmitter<void>();

    @Output()
    profileClick = new EventEmitter<Event>();

    @Output()
    logout = new EventEmitter<void>();

    auth = inject(Auth);

    @ViewChild('profileMenu') profileMenu: any;
    @ViewChild('changePasswordDialog') changePasswordDialog!: ChangePasswordComponent;

    profileVisible = false;
    rolesVisible = false;
    permissionsVisible = false;

    profileMenuItems: MenuItem[] = [
        {
            label: 'Mi Perfil',
            icon: 'pi pi-user',
            command: () => this.profileVisible = true
        },
        {
            label: 'Cambiar Contraseña',
            icon: 'pi pi-key',
            command: () => this.changePasswordDialog.show()
        },
        {
            label: 'Mis Roles',
            icon: 'pi pi-id-card',
            command: () => this.rolesVisible = true
        },
        {
            label: 'Mis Permisos',
            icon: 'pi pi-lock',
            command: () => this.permissionsVisible = true
        },
        { separator: true },
        {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: () => this.testLogout()
        }
    ];

    ngOnInit() {
    }

    onProfileIconClick(event: Event) {
        this.profileMenu.toggle(event);
    }

    testLogout(): void {
        this.logout.emit();
    }

}