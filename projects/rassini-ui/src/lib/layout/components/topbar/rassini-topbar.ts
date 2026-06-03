import {
    Component,
    EventEmitter,
    Output
} from '@angular/core';

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
                    src="assets/images/rassini-logo.png"
                    alt="Rassini"
                    class="rui-logo">

            </div>

            <div class="rui-topbar-right">

                <i class="pi pi-calendar"></i>

                <i class="pi pi-inbox"></i>

                <i class="pi pi-user"></i>

            </div>

        </header>
    `,
    styleUrl: './rassini-topbar.scss'
})
export class RassiniTopbar {

    @Output()
    menuToggle = new EventEmitter<void>();

}