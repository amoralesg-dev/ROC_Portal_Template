import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { Auth } from '../../../services/auth';
import { finalize } from 'rxjs/operators';

import {
    RASSINI_FAVICON,
    RASSINI_LOGO
} from '../../../assets/rassini-assets';

@Component({
    selector: 'rui-login',
    standalone: true,
    imports: [
        FormsModule,
        ButtonModule,
        InputTextModule,
        PasswordModule
    ],
    templateUrl: './rassini-login.html',
    styleUrls: ['./rassini-login.scss']
})
export class RassiniLogin {

    username: string = '';

    password: string = '';

    @Input()
    errorMessage = '';

    @Input()
    loading = false;

    @Output()
    loginEvent = new EventEmitter<{
        username: string;
        password: string;
    }>();
    @Input()
    title = 'Bienvenido a Rassini';

    @Input()
    subtitle = 'Inicia sesión para continuar';

    @Input()
    applicationName = '';

    @Input()
    usernameLabel = 'Usuario';

    @Input()
    usernamePlaceholder = 'Usuario';

    @Input()
    passwordLabel = 'Contraseña';

    @Input()
    passwordPlaceholder = 'Contraseña';

    @Input()
    loginButtonText = 'Iniciar Sesión';

    @Input()
    loadingText = 'Iniciando sesión...';

    logo = RASSINI_LOGO;

    mfaPending = false;
    mfaSetupRequired = false;
    qrCodeUri = '';
    manualEntryKey = '';
    
    tempToken = '';
    mfaCode = '';

    expiresIn: number = 0;
    countdown: number = 0;
    private timerInterval: any;
    
    Math = Math;

    constructor(
        private readonly auth: Auth,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {

    }

    ngOnDestroy(): void {
        this.clearTimer();
    }

    private clearTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private startCountdown(): void {
        this.clearTimer();
        this.timerInterval = setInterval(() => {
            if (this.countdown > 0) {
                this.countdown--;
                this.cdr.detectChanges();
            } else {
                this.clearTimer();
                this.cdr.detectChanges();
            }
        }, 1000);
    }

    resetMfaState(msg: string): void {
        this.clearTimer();
        this.mfaPending = false;
        this.mfaSetupRequired = false;
        this.qrCodeUri = '';
        this.manualEntryKey = '';
        this.tempToken = '';
        this.mfaCode = '';
        this.password = '';
        this.errorMessage = msg;
        this.cdr.detectChanges();
    }

    onLogin(): void {

        this.loginEvent.emit({
            username: this.username,
            password: this.password
        });

        this.loading = true;
        this.errorMessage = '';
        this.auth.login(this.username, this.password).pipe(
            finalize(() => {
                console.log('LOGIN FINALIZE');
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (res: any) => {
                console.log('LOGIN SUCCESS');
                if (res && res.tempToken) {
                    this.mfaPending = true;
                    this.mfaSetupRequired = res.mfaSetupRequired || false;
                    this.qrCodeUri = res.qrCodeUri || '';
                    this.manualEntryKey = res.manualEntryKey || '';
                    this.tempToken = res.tempToken;
                    this.expiresIn = res.expiresIn || (this.mfaSetupRequired ? 900 : 300);
                    this.countdown = this.expiresIn;
                    this.errorMessage = '';
                    this.startCountdown();
                } else {
                    const route = '/';
                    this.router.navigate([route]);
                }
            },
            error: (err) => {
                console.log('LOGIN ERROR', err);
                if (err.status === 401) {
                    this.errorMessage = 'Usuario o contraseña incorrectos.';
                } else if (err.status === 403) {
                    this.errorMessage = 'Tu usuario se encuentra deshabilitado. Contacta a un administrador.';
                } else if (err.status === 500) {
                    this.errorMessage = 'Ocurrió un error interno del sistema. Intenta nuevamente.';
                } else if (err.status === 0) {
                    this.errorMessage = 'No fue posible conectar con el servicio. Intenta nuevamente.';
                } else {
                    this.errorMessage = 'Usuario o contraseña incorrectos.';
                }
                this.cdr.detectChanges();
            }
        });

    }

    onVerifyMfa(): void {
        if (this.countdown <= 0) {
            this.resetMfaState('La sesión de configuración MFA expiró. Inicia sesión nuevamente.');
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.auth.verifyMfa(this.tempToken, this.mfaCode).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: () => {
                this.clearTimer();
                const route = '/';
                this.router.navigate([route]);
            },
            error: (err) => {
                if (err.status === 401 && err.error?.code) {
                    this.resetMfaState(err.error.message || 'La sesión de verificación expiró. Inicia sesión nuevamente.');
                } else if (err.status === 401) {
                    this.resetMfaState('La sesión de verificación expiró. Inicia sesión nuevamente.');
                } else if (err.status === 400 || err.status === 403) {
                    this.errorMessage = err.error?.message || 'Código incorrecto o token expirado.';
                    if (this.errorMessage.toLowerCase().includes('límite') || this.errorMessage.toLowerCase().includes('utilizado')) {
                        this.resetMfaState(this.errorMessage);
                    }
                } else if (err.status === 429) {
                     this.resetMfaState(err.error?.message || 'Demasiados intentos fallidos.');
                } else if (err.status === 500) {
                     this.resetMfaState('Ocurrió un error interno del servidor. Inicia sesión nuevamente.');
                } else {
                    this.errorMessage = 'Ocurrió un error al verificar el código.';
                }
                this.cdr.detectChanges();
            }
        });
    }

}