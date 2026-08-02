export interface AuthConfiguration {
    loginUrl: string;
    refreshUrl: string;
    meUrl: string;
    logoutUrl?: string;
    accessTokenStorageKey?: string;
    refreshTokenStorageKey?: string;
}
