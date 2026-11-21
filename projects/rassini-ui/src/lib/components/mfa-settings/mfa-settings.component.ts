import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AccountSecurityService } from '../../services/account-security.service';
import { finalize } from 'rxjs/operators';
import { RassiniI18nService } from '../../i18n';

@Component({
    selector: 'rui-mfa-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, PasswordModule],
    templateUrl: './mfa-settings.component.html'
})
export class MfaSettingsComponent {
    private readonly auth = inject(AccountSecurityService);
    private readonly cdr = inject(ChangeDetectorRef);
    readonly i18n = inject(RassiniI18nService, { optional: true });

    t(key: string, def?: string): string {
        return this.i18n ? this.i18n.translate(key, def) : (def || key);
    }

    visible = false;
    loading = false;
    errorMessage = '';
    successMessage = '';

    // Estado del usuario
    get isMfaEnabled(): boolean {
        return this.auth.mfaEnabled;
    }

    get isMfaRequired(): boolean {
        return this.auth.mfaRequired;
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
        if (this.auth.isOidcSession) {
            // En sesión OIDC el estado MFA no viene en el token: se consulta antes de decidir el flujo.
            this.loading = true;
            this.auth.refreshContext().pipe(
                finalize(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                })
            ).subscribe(() => {
                if (!this.isMfaEnabled) {
                    this.startSetup();
                }
            });
            return;
        }
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
                this.auth.refreshContext().subscribe();
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
                this.auth.refreshContext().subscribe();
            },
            error: (err) => {
                this.errorMessage = err.error?.message || 'Código o contraseña incorrectos.';
            }
        });
    }
}
