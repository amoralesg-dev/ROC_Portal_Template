import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class Auth {

    private readonly STORAGE_KEY = 'rassini-session';

    login(
        username: string,
        password: string
    ): boolean {

        const authenticated =
            username === 'admin'
            && password === '123';

        if (authenticated) {

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify({
                    username,
                    authenticated: true
                })
            );

        }

        return authenticated;

    }

    logout(): void {

        localStorage.removeItem(
            this.STORAGE_KEY
        );

    }

    isAuthenticated(): boolean {

        return !!localStorage.getItem(
            this.STORAGE_KEY
        );

    }

    getSession(): any {

        const session = localStorage.getItem(
            this.STORAGE_KEY
        );

        return session
            ? JSON.parse(session)
            : null;

    }

}