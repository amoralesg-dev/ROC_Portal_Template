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

    constructor(
        private readonly auth: Auth,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {

    }

    onLogin(): void {

        this.loginEvent.emit({
            username: this.username,
            password: this.password
        });

        this.loading = true;
        this.auth.login(this.username, this.password).pipe(
            finalize(() => {
                console.log('LOGIN FINALIZE');
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (res) => {
                console.log('LOGIN SUCCESS');
                const route = '/';
                this.router.navigate([route]);
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

}