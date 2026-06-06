import {
    EnvironmentProviders,
    makeEnvironmentProviders
} from '@angular/core';

import {
    providePrimeNG
} from 'primeng/config';

import {
    RassiniPreset
} from './rassini-preset';

import {
    RASSINI_GLOBAL_STYLES
} from './rassini-global-styles';

export function provideRassiniTheme(): EnvironmentProviders {

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

        })

    ]);

}