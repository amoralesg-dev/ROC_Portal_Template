import { Component, inject } from '@angular/core';

import { Auth, RassiniLogin } from 'rassini-ui';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RassiniLogin],
    template: `
        <rui-login
            (loginEvent)="onLogin($event)">
        </rui-login>
    `
})
export class Login {

    private router = inject(Router);

    private auth = inject(Auth);

    onLogin(event: {
        username: string;
        password: string;
    }): void {

        const authenticated = this.auth.login(
            event.username,
            event.password
        );

        if (authenticated) {

            this.router.navigate(['/']);

        } else {

            console.error(
                'USUARIO O CONTRASEÑA INCORRECTOS'
            );

        }

    }

}