import {
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { Auth } from '../../../services/auth';

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
        private readonly router: Router
    ) {

    }

    onLogin(): void {

        this.loginEvent.emit({
            username: this.username,
            password: this.password
        });

        const authenticated =
            this.auth.login(
                this.username,
                this.password
            );

        if (authenticated) {

            this.router.navigate([
                '/dashboard'
            ]);

            return;

        }

        this.errorMessage =
            'Usuario o contraseña inválidos';

    }

}