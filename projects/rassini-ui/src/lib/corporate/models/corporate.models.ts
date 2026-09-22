export interface CorporateBusinessUnit {
  id: number;
  code: string;
  name: string;
  parentId?: number | null;
  enabled?: boolean;
}

export interface CorporateUser {
  userId: number;
  employeeId?: string | null;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  businessUnits: CorporateBusinessUnit[];
  hasAllBusinessUnits: boolean;
}

export interface CorporateTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
  expiresIn?: number;
  scope?: string;
}

export interface CorporateOidcConfig {
  issuer: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri?: string;
  scope?: string;
  responseType?: string;
  allowedApiOrigins: string[];
  applicationCode: string;
}

export interface CorporateNavigationMenu {
  id: number;
  code: string;
  label: string;
  route: string | null;
  icon?: string | null;
  orderIndex?: number | null;
  parentId?: number | null;
  targetType?: 'INTERNO' | 'EXTERNO';
  externalUrl?: string | null;
  resolvedUrl?: string | null;
  openInNewTab?: boolean;
  children?: CorporateNavigationMenu[];
}

export interface CorporateApplicationInfo {
  code: string;
  name: string;
  baseUrl: string;
  icon?: string;
  enabled: boolean;
}

export class MissingContextPlaceholderError extends Error {
  constructor(placeholder: string) {
    super(`Missing required context placeholder: ${placeholder}`);
    this.name = 'MissingContextPlaceholderError';
  }
}
