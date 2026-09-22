import { Injectable, signal, computed, Optional, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  CorporateTokens, 
  CorporateUser, 
  CorporateOidcConfig, 
  CorporateBusinessUnit
} from '../models/corporate.models';
import { TokenStorageAdapter, InMemoryTokenStorageAdapter } from '../storage/token-storage.adapter';
import { 
  BusinessUnitCatalogAdapter, 
  BUSINESS_UNIT_CATALOG_ADAPTER,
  MissingBusinessUnitCatalogError,
  UnauthorizedBusinessUnitError
} from './business-unit-catalog.adapter';

export interface JwtClaimsPayload {
  sub: string;
  userId?: number;
  employeeId?: string | null;
  email?: string;
  roles?: string[];
  permissions?: string[];
  businessUnits?: CorporateBusinessUnit[];
  hasAllBusinessUnits?: boolean;
  exp?: number;
  nonce?: string;
  [key: string]: any;
}

export class MissingApplicationCodeError extends Error {
  constructor() {
    super('Corporate OIDC requires applicationCode in configuration');
    this.name = 'MissingApplicationCodeError';
  }
}

@Injectable()
export class AuthenticationService {
  private config: CorporateOidcConfig | null = null;
  private storageAdapter: TokenStorageAdapter = new InMemoryTokenStorageAdapter();

  readonly currentUser = signal<CorporateUser | null>(null);
  readonly roles = signal<string[]>([]);
  readonly permissions = signal<string[]>([]);
  readonly businessUnits = signal<CorporateBusinessUnit[]>([]);
  readonly hasAllBusinessUnits = signal<boolean>(false);
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.getAccessToken());
  readonly activeBusinessUnit = signal<CorporateBusinessUnit | null>(null);

  constructor(
    private readonly http: HttpClient,
    @Optional() @Inject(BUSINESS_UNIT_CATALOG_ADAPTER) private readonly catalogAdapter: BusinessUnitCatalogAdapter | null
  ) {}

  setStorageAdapter(adapter: TokenStorageAdapter): void {
    this.storageAdapter = adapter;
  }

  setConfig(config: CorporateOidcConfig): void {
    if (!config.applicationCode || config.applicationCode.trim() === '') {
      throw new MissingApplicationCodeError();
    }
    this.config = config;
  }

  getConfig(): CorporateOidcConfig | null {
    return this.config;
  }

  getStorageAdapter(): TokenStorageAdapter {
    return this.storageAdapter;
  }

  getAccessToken(): string | null {
    return this.storageAdapter.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.storageAdapter.getRefreshToken();
  }

  getIdToken(): string | null {
    return this.storageAdapter.getIdToken();
  }

  refreshToken(): Observable<CorporateTokens> {
    if (!this.config) return throwError(() => new Error('Corporate OIDC config is not set'));
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token available'));

    const tokenUrl = `${this.config.issuer}/oauth2/token`;
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', this.config.clientId)
      .set('refresh_token', refreshToken);

    return this.http.post<any>(tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      map(res => {
        const tokens: CorporateTokens = {
          accessToken: res.access_token,
          refreshToken: res.refresh_token || refreshToken,
          idToken: res.id_token,
          tokenType: res.token_type,
          expiresIn: res.expires_in,
          scope: res.scope
        };
        this.applyTokens(tokens);
        return tokens;
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  decodeToken(token: string): JwtClaimsPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as JwtClaimsPayload;
    } catch {
      return null;
    }
  }

  applyTokens(tokens: CorporateTokens): void {
    this.storageAdapter.setTokens(tokens);
    const claims = this.decodeToken(tokens.accessToken);
    if (claims) {
      this.populateUserFromClaims(claims);
    }
  }

  hasValidTokenInStorage(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    const claims = this.decodeToken(token);
    if (!claims) return false;
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) return false;
    return true;
  }

  populateUserFromClaims(claims: JwtClaimsPayload): void {
    const user: CorporateUser = {
      userId: claims.userId ?? 0,
      employeeId: claims.employeeId ?? null,
      username: claims.sub,
      email: claims.email ?? '',
      roles: claims.roles ?? [],
      permissions: claims.permissions ?? [],
      businessUnits: claims.businessUnits ?? [],
      hasAllBusinessUnits: claims.hasAllBusinessUnits ?? false
    };

    this.currentUser.set(user);
    this.roles.set(user.roles);
    this.permissions.set(user.permissions);
    this.businessUnits.set(user.businessUnits);
    this.hasAllBusinessUnits.set(user.hasAllBusinessUnits);

    this.resolveInitialBusinessUnit(user);
  }

  private resolveInitialBusinessUnit(user: CorporateUser): void {
    const appCode = this.config?.applicationCode || 'default_app';
    const storageKey = `rassini:${appCode}:${user.username}:activeBusinessUnit`;

    const savedBuJson = this.storageAdapter.getItem(storageKey);
    if (savedBuJson) {
      try {
        const parsed = JSON.parse(savedBuJson) as CorporateBusinessUnit;
        if (!user.hasAllBusinessUnits && user.businessUnits.some(b => b.code === parsed.code)) {
          this.activeBusinessUnit.set(parsed);
          return;
        }
      } catch {
        this.storageAdapter.removeItem(storageKey);
      }
    }

    if (!user.hasAllBusinessUnits && user.businessUnits.length === 1) {
      const singleBu = user.businessUnits[0];
      this.setActiveBusinessUnit(singleBu);
    } else {
      this.activeBusinessUnit.set(null);
    }
  }

  setActiveBusinessUnit(bu: CorporateBusinessUnit, trustedCatalog?: CorporateBusinessUnit[]): void {
    const user = this.currentUser();
    if (!user) {
      throw new Error('Cannot set active business unit without authenticated user');
    }

    if (user.hasAllBusinessUnits) {
      const catalog = trustedCatalog;
      if (!catalog || catalog.length === 0) {
        throw new MissingBusinessUnitCatalogError();
      }

      const foundInCatalog = catalog.find(b => b.code === bu.code && b.id === bu.id);
      if (!foundInCatalog) {
        throw new UnauthorizedBusinessUnitError(bu.code);
      }

      this.activeBusinessUnit.set(foundInCatalog);
    } else {
      const authorized = user.businessUnits.find(b => b.code === bu.code && b.id === bu.id);
      if (!authorized) {
        throw new UnauthorizedBusinessUnitError(bu.code);
      }
      this.activeBusinessUnit.set(authorized);
    }

    const appCode = this.config?.applicationCode || 'default_app';
    const storageKey = `rassini:${appCode}:${user.username}:activeBusinessUnit`;
    this.storageAdapter.setItem(storageKey, JSON.stringify(this.activeBusinessUnit()));
  }

  restoreSession(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    const claims = this.decodeToken(token);
    if (!claims) {
      this.logout(false);
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) {
      this.logout(false);
      return false;
    }

    this.populateUserFromClaims(claims);
    return true;
  }

  async buildAuthorizationUrl(): Promise<string> {
    if (!this.config) throw new Error('Corporate OIDC config is not set');
    if (!this.config.issuer || this.config.issuer.trim() === '') {
      throw new Error('Corporate OIDC config missing valid issuer');
    }
    if (!this.config.clientId || this.config.clientId.trim() === '') {
      throw new Error('Corporate OIDC config missing valid clientId');
    }
    if (!this.config.redirectUri || this.config.redirectUri.trim() === '') {
      throw new Error('Corporate OIDC config missing valid redirectUri');
    }
    try {
      new URL(this.config.redirectUri);
    } catch {
      throw new Error('Corporate OIDC config contains invalid redirectUri format');
    }

    const state = this.generateRandomString(32);
    const nonce = this.generateRandomString(32);
    const codeVerifier = this.generateRandomString(64);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    this.storageAdapter.setItem('rassini_auth_state', state);
    this.storageAdapter.setItem('rassini_auth_nonce', nonce);
    this.storageAdapter.setItem('rassini_auth_verifier', codeVerifier);

    const redirectUri = this.config.redirectUri;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      scope: this.config.scope || 'openid profile email',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      nonce: nonce
    });

    return `${this.config.issuer}/oauth2/authorize?${params.toString()}`;
  }

  handleCallback(code: string, returnedState: string): Observable<CorporateTokens> {
    if (!this.config) return throwError(() => new Error('Corporate OIDC config is not set'));

    if (!code || code.trim() === '') {
      return throwError(() => new Error('Missing authorization code in callback'));
    }

    const expectedState = this.storageAdapter.getItem('rassini_auth_state');
    const verifier = this.storageAdapter.getItem('rassini_auth_verifier');
    const expectedNonce = this.storageAdapter.getItem('rassini_auth_nonce');

    this.storageAdapter.removeItem('rassini_auth_state');
    this.storageAdapter.removeItem('rassini_auth_verifier');
    this.storageAdapter.removeItem('rassini_auth_nonce');

    if (!expectedState || expectedState !== returnedState) {
      return throwError(() => new Error('Invalid OAuth2 state parameter'));
    }

    if (!verifier) {
      return throwError(() => new Error('Missing OAuth2 PKCE code verifier'));
    }

    const tokenUrl = `${this.config.issuer}/oauth2/token`;
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.config.clientId)
      .set('code', code)
      .set('redirect_uri', this.config.redirectUri)
      .set('code_verifier', verifier);

    return this.http.post<any>(tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      map(res => {
        const tokens: CorporateTokens = {
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          idToken: res.id_token,
          tokenType: res.token_type,
          expiresIn: res.expires_in,
          scope: res.scope
        };

        if (tokens.idToken && expectedNonce) {
          const idClaims = this.decodeToken(tokens.idToken);
          if (idClaims && idClaims.nonce && idClaims.nonce !== expectedNonce) {
            throw new Error('Invalid OpenID Connect ID token nonce');
          }
        }

        this.applyTokens(tokens);

        if (typeof window !== 'undefined' && window.history && window.location) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        return tokens;
      })
    );
  }

  buildLogoutUrl(): string {
    if (!this.config?.issuer) return '';
    const idToken = this.storageAdapter.getIdToken();
    const postLogoutUri = this.config.postLogoutRedirectUri || (typeof window !== 'undefined' ? window.location.origin : '');
    const params = new URLSearchParams();
    if (idToken) {
      params.set('id_token_hint', idToken);
    }
    if (postLogoutUri) {
      params.set('post_logout_redirect_uri', postLogoutUri);
    }
    if (this.config.clientId) {
      params.set('client_id', this.config.clientId);
    }
    return `${this.config.issuer}/connect/logout?${params.toString()}`;
  }

  async logout(redirect: boolean = true): Promise<void> {
    const user = this.currentUser();
    const appCode = this.config?.applicationCode || 'default_app';

    if (user) {
      this.storageAdapter.removeItem(`rassini:${appCode}:${user.username}:activeBusinessUnit`);
    }

    this.storageAdapter.clear();
    this.storageAdapter.removeItem('rassini_auth_state');
    this.storageAdapter.removeItem('rassini_auth_nonce');
    this.storageAdapter.removeItem('rassini_auth_verifier');

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`rassini_${appCode}_access_token`);
      localStorage.removeItem(`rassini_${appCode}_refresh_token`);
      localStorage.removeItem(`rassini_${appCode}_id_token`);
      localStorage.removeItem('rassini_auth_token');
    }

    this.currentUser.set(null);
    this.roles.set([]);
    this.permissions.set([]);
    this.businessUnits.set([]);
    this.hasAllBusinessUnits.set(false);
    this.activeBusinessUnit.set(null);

    if (redirect && typeof window !== 'undefined' && window.location) {
      const logoutUrl = this.buildLogoutUrl();
      if (logoutUrl) {
        window.location.href = logoutUrl;
      } else {
        const postLogout = this.config?.postLogoutRedirectUri || '/logout';
        window.location.href = postLogout;
      }
    }
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role) || this.roles().includes('ROLE_ADMIN') || this.roles().includes('IAM_ADMIN');
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission) || this.permissions().includes('IAM_ADMIN');
  }

  hasBusinessUnit(buCode: string): boolean {
    if (this.hasAllBusinessUnits()) return true;
    return this.businessUnits().some(b => b.code === buCode);
  }

  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    return Array.from(values).map(v => charset[v % charset.length]).join('');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    let str = '';
    bytes.forEach(b => str += String.fromCharCode(b));
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
