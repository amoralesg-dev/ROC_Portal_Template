export interface AuthConfiguration {
    loginUrl: string;
    refreshUrl: string;
    meUrl: string;
    logoutUrl?: string;
    changePasswordUrl?: string;
    accessTokenStorageKey?: string;
    refreshTokenStorageKey?: string;
}
