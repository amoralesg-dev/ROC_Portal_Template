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
import { DialogModule } from 'primeng/dialog';
import { MenuItem } from 'primeng/api';
import { Auth } from '../../../services/auth';
import { AuthenticationService } from '../../../corporate/services/authentication.service';
import { ChangePasswordComponent } from '../../../components/change-password/change-password.component';
import { MfaSettingsComponent } from '../../../components/mfa-settings/mfa-settings.component';

@Component({
    selector: 'rui-topbar',
    standalone: true,
    imports: [CommonModule, DialogModule, ChangePasswordComponent, MfaSettingsComponent],
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

                <div class="rui-profile-wrapper" style="position: relative;">
                    <div class="rui-profile-button cursor-pointer flex align-items-center gap-2" (click)="toggleProfileMenu($event)" title="{{ displayUsername }}">
                        <i class="pi pi-user"></i>
                        <span class="rui-profile-username text-overflow-ellipsis white-space-nowrap overflow-hidden">{{ displayUsername }}</span>
                    </div>

                    <!-- Lightweight Profile Dropdown Menu without PrimeNG MenuModule / RouterModule dependency -->
                    <div *ngIf="profileMenuOpen" class="rui-profile-dropdown" style="position: absolute; right: 0; top: 100%; margin-top: 8px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 220px; z-index: 1100; overflow: hidden;">
                        <ul style="list-style: none; margin: 0; padding: 6px 0; font-size: 0.9rem;">
                            <li *ngFor="let item of profileMenuItems">
                                <ng-container *ngIf="item.separator">
                                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 4px 0;">
                                </ng-container>
                                <ng-container *ngIf="!item.separator">
                                    <button type="button" (click)="onItemClick(item)" style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 16px; border: none; background: transparent; text-align: left; cursor: pointer; color: #334155; font-size: 0.9rem;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                        <i [class]="item.icon" style="color: #64748b; width: 16px;"></i>
                                        <span>{{ item.label }}</span>
                                    </button>
                                </ng-container>
                            </li>
                        </ul>
                    </div>
                </div>

                <i
                    class="pi pi-sign-out cursor-pointer"
                    (click)="testLogout()">
                </i>

            </div>

        </header>

        <p-dialog header="Mi Perfil" [(visible)]="profileVisible" [modal]="true" [style]="{width: '400px'}" appendTo="body">
            <div class="flex flex-col gap-3">
                <div><strong>Usuario:</strong> {{ displayUsername }}</div>
                <div><strong>Email:</strong> {{ displayEmail }}</div>
                <div><strong>Roles:</strong> {{ displayRoles.length ? displayRoles.join(', ') : 'Ninguno' }}</div>
            </div>
        </p-dialog>

        <p-dialog header="Mis Roles" [(visible)]="rolesVisible" [modal]="true" [style]="{width: '400px'}" appendTo="body">
            <ul class="list-none p-0 m-0">
                <li *ngFor="let role of displayRoles" class="p-2 border-b">{{ role }}</li>
            </ul>
            <div *ngIf="!displayRoles.length" class="p-2 text-gray-500">No tienes roles asignados.</div>
        </p-dialog>

        <p-dialog header="Mis Permisos" [(visible)]="permissionsVisible" [modal]="true" [style]="{width: '400px'}" appendTo="body">
            <ul class="list-none p-0 m-0">
                <li *ngFor="let perm of displayPermissions" class="p-2 border-b">{{ perm }}</li>
            </ul>
            <div *ngIf="!displayPermissions.length" class="p-2 text-gray-500">No tienes permisos asignados.</div>
        </p-dialog>

        <app-change-password #changePasswordDialog></app-change-password>
        <rui-mfa-settings #mfaSettingsDialog></rui-mfa-settings>
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

    auth = inject(Auth, { optional: true });
    corporateAuth = inject(AuthenticationService, { optional: true });

    get displayUsername(): string {
        return this.corporateAuth?.currentUser()?.username || this.auth?.currentUser()?.username || '';
    }

    get displayEmail(): string {
        return this.corporateAuth?.currentUser()?.email || this.auth?.currentUser()?.email || '';
    }

    get displayRoles(): string[] {
        return this.corporateAuth?.roles() || this.auth?.roles() || [];
    }

    get displayPermissions(): string[] {
        return this.corporateAuth?.permissions() || this.auth?.permissions() || [];
    }

    @ViewChild('changePasswordDialog') changePasswordDialog!: ChangePasswordComponent;
    @ViewChild('mfaSettingsDialog') mfaSettingsDialog!: MfaSettingsComponent;

    profileMenuOpen = false;
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
            label: 'Seguridad (Autenticador 2FA)',
            icon: 'pi pi-shield',
            command: () => this.mfaSettingsDialog.show()
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

    toggleProfileMenu(event: Event) {
        event.stopPropagation();
        this.profileMenuOpen = !this.profileMenuOpen;
    }

    onItemClick(item: MenuItem) {
        this.profileMenuOpen = false;
        if (item.command) {
            item.command({ item });
        }
    }

    testLogout(): void {
        this.profileMenuOpen = false;
        this.logout.emit();
    }

}