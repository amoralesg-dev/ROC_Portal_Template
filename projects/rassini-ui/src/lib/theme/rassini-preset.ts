import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export const RassiniPreset = definePreset(Aura, {

    primitive: {

        gray: {
            50: '#F8F9FA',
            100: '#F1F3F5',
            200: '#E9ECEF',
            300: '#DEE2E6',
            400: '#CED4DA',
            500: '#ADB5BD',
            600: '#868E96',
            700: '#6C757D',
            800: '#565A5C',
            900: '#343A40',
            950: '#212529'
        },

        orange: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',

            // Colores corporativos Rassini
            500: '#F39C12',
            600: '#E98300',
            700: '#D2492A',

            800: '#B03A1E',
            900: '#7C2D12',
            950: '#431407'
        }

    },

    semantic: {

        primary: {
            50: '{orange.50}',
            100: '{orange.100}',
            200: '{orange.200}',
            300: '{orange.300}',
            400: '{orange.400}',
            500: '{orange.500}',
            600: '{orange.600}',
            700: '{orange.700}',
            800: '{orange.800}',
            900: '{orange.900}',
            950: '{orange.950}'
        },

        colorScheme: {

            light: {

                content: {
                    background: '{gray.50}'
                },

                surface: {
                    0: '#FFFFFF',
                    50: '{gray.50}',
                    100: '{gray.100}',
                    200: '{gray.200}',
                    300: '{gray.300}',
                    400: '{gray.400}',
                    500: '{gray.500}',
                    600: '{gray.600}',
                    700: '{gray.700}',
                    800: '{gray.800}',
                    900: '{gray.900}',
                    950: '{gray.950}'
                }

            }

        }

    }

});