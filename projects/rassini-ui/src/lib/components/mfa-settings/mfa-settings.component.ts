import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Auth } from '../../services/auth';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'rui-mfa-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, PasswordModule],
    templateUrl: './mfa-settings.component.html'
})
export class MfaSettingsComponent {
    private readonly auth = inject(Auth);
    private readonly cdr = inject(ChangeDetectorRef);

    visible = false;
    loading = false;
    errorMessage = '';
    successMessage = '';

    // Estado del usuario
    get isMfaEnabled(): boolean {
        return this.auth.currentUser()?.mfaEnabled ?? false;
    }

    get isMfaRequired(): boolean {
        return this.auth.currentUser()?.mfaRequired ?? false;
    }

    // Flujo de Setup
    setupData: any = null;
    activationCode = '';

    // Flujo de Disable
    password = '';
    disableCode = '';

    show(): void {
        this.reset();
        this.visible = true;
        if (!this.isMfaEnabled) {
            this.startSetup();
        }
    }

    hide(): void {
        this.visible = false;
    }

    reset(): void {
        this.loading = false;
        this.errorMessage = '';
        this.successMessage = '';
        this.setupData = null;
        this.activationCode = '';
        this.password = '';
        this.disableCode = '';
    }

    startSetup(): void {
        this.loading = true;
        this.errorMessage = '';
        this.auth.setupMfa().pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (res) => {
                this.setupData = res;
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Error al iniciar la configuración de MFA.';
            }
        });
    }

    activateMfa(): void {
        this.loading = true;
        this.errorMessage = '';
        this.auth.activateMfa(this.activationCode).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: () => {
                this.successMessage = 'Autenticador activado con éxito.';
                this.setupData = null;
                // Actualizar contexto para reflejar mfaEnabled = true
                this.auth.loadContext().subscribe();
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Código incorrecto.';
            }
        });
    }

    disableMfa(): void {
        this.loading = true;
        this.errorMessage = '';
        this.auth.disableMfa(this.password, this.disableCode).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: () => {
                this.successMessage = 'Autenticador desactivado con éxito.';
                this.password = '';
                this.disableCode = '';
                // Actualizar contexto para reflejar mfaEnabled = false
                this.auth.loadContext().subscribe();
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Código o contraseña incorrectos.';
            }
        });
    }
}
