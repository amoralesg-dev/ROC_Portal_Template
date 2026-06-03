export interface RassiniMenuItem {

    label: string;

    icon?: string;

    routerLink?: string | string[];

    items?: RassiniMenuItem[];

    expanded?: boolean;

}