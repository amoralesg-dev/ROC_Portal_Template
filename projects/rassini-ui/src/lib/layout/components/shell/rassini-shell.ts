import {
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { RassiniTopbar } from '../topbar/rassini-topbar';
import { RassiniSidebar } from '../sidebar/rassini-sidebar';
import { RassiniMenuItem } from '../../models';

@Component({
    selector: 'rui-shell',
    standalone: true,
    imports: [
        CommonModule,
        RassiniTopbar,
        RassiniSidebar,
        
        
    ],
    styleUrl: './rassini-shell.scss',
    template: `
        <rui-topbar
        (menuToggle)="toggleSidebar()"
        (logout)="onLogout()">
    </rui-topbar>

    @if (sidebarVisible) {

        <div
            class="rui-sidebar-mask"
            (click)="closeSidebar()">
        </div>

    }

    <rui-sidebar
        [visible]="sidebarVisible"
        [menu]="menu"
        (itemClick)="closeSidebarMobile()">
    </rui-sidebar>

    <div
        class="rui-shell-content"
        [class.rui-shell-content-expanded]="!sidebarVisible">

        

        <ng-content></ng-content>

    </div>

    `
})
export class RassiniShell {

    @Input()
    menu: RassiniMenuItem[] = [];

    @Output()
    sidebarVisibleChange = new EventEmitter<boolean>();

    @Output()
    logout = new EventEmitter<void>();

    sidebarVisible = window.innerWidth > 991;

    get sidebarHidden(): boolean {
        return !this.sidebarVisible;
    }

    toggleSidebar(): void {

    this.sidebarVisible = !this.sidebarVisible;

    this.sidebarVisibleChange.emit(this.sidebarVisible);

    
    }

    closeSidebar(): void {

        this.sidebarVisible = false;

        this.sidebarVisibleChange.emit(false);

    }
    closeSidebarMobile(): void {


        if (window.innerWidth <= 991) {

            this.sidebarVisible = false;

            this.sidebarVisibleChange.emit(false);

        }

    }
    onLogout(): void {


        this.logout.emit();

    }
}