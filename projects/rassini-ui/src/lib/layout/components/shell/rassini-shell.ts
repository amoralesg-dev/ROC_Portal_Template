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
            (menuToggle)="toggleSidebar()">
        </rui-topbar>

        <rui-sidebar
            [visible]="sidebarVisible"
            [menu]="menu">
        </rui-sidebar>

        <ng-content></ng-content>
    `
})
export class RassiniShell {

    @Input()
    menu: RassiniMenuItem[] = [];

    @Output()
    sidebarVisibleChange = new EventEmitter<boolean>();

    sidebarVisible = true;

    get sidebarHidden(): boolean {
        return !this.sidebarVisible;
    }

    toggleSidebar(): void {

    this.sidebarVisible = !this.sidebarVisible;

    this.sidebarVisibleChange.emit(this.sidebarVisible);
}
}