import { Component, inject } from '@angular/core';

import { Auth, RassiniLogin } from 'rassini-ui';
import { Router } from '@angular/router';


@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RassiniLogin],
    template: `
        <rui-login
            [loading]="loading"
            [errorMessage]="errorMessage"
            (loginEvent)="onLogin($event)">
        </rui-login>
    `
})
export class Login {

    private router = inject(Router);

    private auth = inject(Auth);

    errorMessage = '';

    loading = false;

onLogin(event: {
    username: string;
    password: string;
    }): void {

        this.loading = true;

        Promise.resolve().then(() => {

            const authenticated = this.auth.login(
                event.username,
                event.password
            );

            this.loading = false;

            if (authenticated) {

                this.errorMessage = '';

                this.router.navigate(['/']);

            } else {

                this.errorMessage =
                    'Usuario o contraseña incorrectos';

            }

        });

    }

}