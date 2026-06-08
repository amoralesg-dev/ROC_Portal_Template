import { Component, Input } from '@angular/core';
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

    logo = RASSINI_LOGO;

    constructor(
        private readonly auth: Auth,
        private readonly router: Router
    ) {


    }

    onLogin(): void {

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