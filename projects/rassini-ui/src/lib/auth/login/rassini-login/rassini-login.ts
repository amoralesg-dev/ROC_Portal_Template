import {
    Component,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RassiniI18nService } from '../../../i18n';

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
    title?: string;

    @Input()
    subtitle?: string;

    @Input()
    applicationName = '';

    @Input()
    usernameLabel?: string;

    @Input()
    usernamePlaceholder?: string;

    @Input()
    passwordLabel?: string;

    @Input()
    passwordPlaceholder?: string;

    @Input()
    loginButtonText?: string;

    @Input()
    loadingText?: string;

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

    private readonly i18n = inject(RassiniI18nService, { optional: true });

    constructor(
        private readonly auth: Auth,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {

    }

    t(key: string, defaultValue: string): string {
        return this.i18n ? this.i18n.translate(key, defaultValue) : defaultValue;
    }

    get displayTitle(): string {
        return this.title ?? this.t('rassini.auth.login.title', 'Bienvenido a Rassini');
    }

    get displaySubtitle(): string {
        return this.subtitle ?? this.t('rassini.auth.login.subtitle', 'Inicia sesión para continuar');
    }

    get displayUsernameLabel(): string {
        return this.usernameLabel ?? this.t('rassini.auth.login.usernameLabel', 'Usuario');
    }

    get displayUsernamePlaceholder(): string {
        return this.usernamePlaceholder ?? this.t('rassini.auth.login.usernamePlaceholder', 'Usuario');
    }

    get displayPasswordLabel(): string {
        return this.passwordLabel ?? this.t('rassini.auth.login.passwordLabel', 'Contraseña');
    }

    get displayPasswordPlaceholder(): string {
        return this.passwordPlaceholder ?? this.t('rassini.auth.login.passwordPlaceholder', 'Contraseña');
    }

    get displayLoginButtonText(): string {
        return this.loginButtonText ?? this.t('rassini.auth.login.loginButton', 'Iniciar Sesión');
    }

    get displayLoadingText(): string {
        return this.loadingText ?? this.t('rassini.auth.login.signingIn', 'Iniciando sesión...');
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
                    this.errorMessage = this.t('rassini.auth.login.invalidCredentials', 'Usuario o contraseña incorrectos.');
                } else if (err.status === 403) {
                    this.errorMessage = this.t('rassini.auth.login.userDisabled', 'Tu usuario se encuentra deshabilitado. Contacta a un administrador.');
                } else if (err.status === 500) {
                    this.errorMessage = this.t('rassini.auth.login.internalError', 'Ocurrió un error interno del sistema. Intenta nuevamente.');
                } else if (err.status === 0) {
                    this.errorMessage = this.t('rassini.auth.login.connectionError', 'No fue posible conectar con el servicio. Intenta nuevamente.');
                } else {
                    this.errorMessage = this.t('rassini.auth.login.invalidCredentials', 'Usuario o contraseña incorrectos.');
                }
                this.cdr.detectChanges();
            }
        });

    }

    onVerifyMfa(): void {
        if (this.countdown <= 0) {
            this.resetMfaState(this.t('rassini.auth.login.mfaSessionExpired', 'La sesión de configuración MFA expiró. Inicia sesión nuevamente.'));
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
                    this.resetMfaState(err.error.message || this.t('rassini.auth.login.mfaVerifyExpired', 'La sesión de verificación expiró. Inicia sesión nuevamente.'));
                } else if (err.status === 401) {
                    this.resetMfaState(this.t('rassini.auth.login.mfaVerifyExpired', 'La sesión de verificación expiró. Inicia sesión nuevamente.'));
                } else if (err.status === 400 || err.status === 403) {
                    this.errorMessage = err.error?.message || this.t('rassini.auth.login.mfaInvalidCode', 'Código incorrecto o token expirado.');
                    if (this.errorMessage.toLowerCase().includes('límite') || this.errorMessage.toLowerCase().includes('utilizado')) {
                        this.resetMfaState(this.errorMessage);
                    }
                } else if (err.status === 429) {
                     this.resetMfaState(err.error?.message || this.t('rassini.auth.login.tooManyAttempts', 'Demasiados intentos fallidos.'));
                } else if (err.status === 500) {
                     this.resetMfaState(this.t('rassini.auth.login.internalError', 'Ocurrió un error interno del servidor. Inicia sesión nuevamente.'));
                } else {
                    this.errorMessage = this.t('rassini.auth.login.mfaInvalidCode', 'Ocurrió un error al verificar el código.');
                }
                this.cdr.detectChanges();
            }
        });
    }

}