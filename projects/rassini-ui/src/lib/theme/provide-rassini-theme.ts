import {
EnvironmentProviders,
makeEnvironmentProviders
} from '@angular/core';

import {
MessageService,
ConfirmationService
} from 'primeng/api';

import {
providePrimeNG
} from 'primeng/config';

import {
RassiniPreset
} from './rassini-preset';

import {
loadFavicon
} from './load-favicon';

import {
RASSINI_GLOBAL_STYLES
} from './rassini-global-styles';

import {
loadPrimeIcons
} from './load-primeicons';

import {
    loadPrimeFlex
} from './load-primeflex';

export function provideRassiniTheme(): EnvironmentProviders {


loadFavicon();

loadPrimeIcons();

loadPrimeFlex();

const styleId = 'rassini-global-theme';

if (!document.getElementById(styleId)) {

    const style =
        document.createElement('style');

    style.id = styleId;

    style.innerHTML =
        RASSINI_GLOBAL_STYLES;

    document.head.appendChild(style);

}

return makeEnvironmentProviders([

    providePrimeNG({

        theme: {

            preset: RassiniPreset,

            options: {

                darkModeSelector: '.app-dark'

            }

        }

    }),

    MessageService,

    ConfirmationService

]);


}
