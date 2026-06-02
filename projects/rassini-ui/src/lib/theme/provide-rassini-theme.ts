import { EnvironmentProviders } from '@angular/core';
import { providePrimeNG } from 'primeng/config';

import { RassiniPreset } from './rassini-preset';

export function provideRassiniTheme(): EnvironmentProviders {

    return providePrimeNG({
        theme: {
            preset: RassiniPreset,
            options: {
                darkModeSelector: '.app-dark'
            }
        }
    });

}