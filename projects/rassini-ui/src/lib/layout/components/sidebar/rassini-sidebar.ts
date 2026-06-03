import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RassiniMenuItem } from '../../models';

@Component({
    selector: 'rui-sidebar',
    styleUrl: './rassini-sidebar.scss',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    template: `
        <aside class="rui-sidebar" [class.hidden]="!visible">

            <ul class="rui-menu">

                @for (group of menu; track group.label) {

                    <li class="rui-menu-group">

                        <div class="rui-menu-group-title">
                            {{ group.label }}
                        </div>

                        @if (group.items) {

                            <ul>

                                @for (item of group.items; track item.label) {

                                    <li>

                                        <a
                                            [routerLink]="item.routerLink"
                                            routerLinkActive="active">

                                            <i
                                                [class]="item.icon">
                                            </i>

                                            <span>
                                                {{ item.label }}
                                            </span>

                                        </a>

                                    </li>

                                }

                            </ul>

                        }

                    </li>

                }

            </ul>

        </aside>
    `
})
export class RassiniSidebar {

    @Input()
    menu: RassiniMenuItem[] = [];

    @Input()
    visible = true;

}