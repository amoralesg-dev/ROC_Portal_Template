import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

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

    onLogin(): void {
        this.loginEvent.emit({
            username: this.username,
            password: this.password
        });
    }
}