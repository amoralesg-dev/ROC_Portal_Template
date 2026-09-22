export interface RassiniMenuItem {

    label: string;

    icon?: string | null;

    routerLink?: string | string[] | null;

    items?: RassiniMenuItem[];

    expanded?: boolean;

    targetType?: string;

    externalUrl?: string;

    resolvedUrl?: string;

    openInNewTab?: boolean;

    appType?: string;

    authType?: string;

    code?: string;

    url?: string;

    target?: string;

    command?: (event?: any) => void;

}