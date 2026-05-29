import { Component } from '@angular/core';
import { APP_CONFIG } from '../../config';


@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        {{ appName }} - v{{ version }}
    </div>`
})
export class AppFooter {
    appName = APP_CONFIG.appName;
    version = APP_CONFIG.version;
}
