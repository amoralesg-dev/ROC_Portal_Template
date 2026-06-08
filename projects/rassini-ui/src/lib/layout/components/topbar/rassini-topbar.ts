import {
    Component,
    EventEmitter,
    Output
} from '@angular/core';
import {
    RASSINI_LOGO
} from '../../../assets/rassini-assets';

@Component({
    selector: 'rui-topbar',
    standalone: true,
    template: `
        <header class="rui-topbar">

            <div class="rui-topbar-left">

                <button
                    type="button"
                    class="rui-menu-button"
                    (click)="menuToggle.emit()">

                    <i class="pi pi-bars"></i>

                </button>

                <img
                    [src]="logo"
                    alt="Rassini"
                    class="rui-logo">

            </div>

            <div class="rui-topbar-right">

                <i class="pi pi-calendar"></i>

                <i class="pi pi-inbox"></i>

                <i class="pi pi-user"></i>

                <i
                    class="pi pi-sign-out"
                    (click)="testLogout()">
                </i>

            </div>

        </header>
    `,
    styleUrl: './rassini-topbar.scss'
})
export class RassiniTopbar {


    logo = RASSINI_LOGO;

    @Output()
    menuToggle = new EventEmitter<void>();

    @Output()
    logout = new EventEmitter<void>();

    testLogout(): void {


        this.logout.emit();

    }

}