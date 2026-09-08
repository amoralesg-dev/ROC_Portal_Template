export interface RassiniMenuItem {

    label: string;

    icon?: string | null;

    routerLink?: string | string[];

    items?: RassiniMenuItem[];

    expanded?: boolean;

}