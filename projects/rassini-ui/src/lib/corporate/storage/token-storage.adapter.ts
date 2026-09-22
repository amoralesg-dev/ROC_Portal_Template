import { CorporateTokens } from '../models/corporate.models';

export interface TokenStorageAdapter {
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string): void;
  getIdToken(): string | null;
  setIdToken(token: string): void;
  getTokens(): CorporateTokens | null;
  setTokens(tokens: CorporateTokens): void;
  clear(): void;

  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class InMemoryTokenStorageAdapter implements TokenStorageAdapter {
  private store = new Map<string, string>();

  getAccessToken(): string | null {
    return this.store.get('access_token') || null;
  }
  setAccessToken(token: string): void {
    this.store.set('access_token', token);
  }
  getRefreshToken(): string | null {
    return this.store.get('refresh_token') || null;
  }
  setRefreshToken(token: string): void {
    this.store.set('refresh_token', token);
  }
  getIdToken(): string | null {
    return this.store.get('id_token') || null;
  }
  setIdToken(token: string): void {
    this.store.set('id_token', token);
  }
  getTokens(): CorporateTokens | null {
    const at = this.getAccessToken();
    if (!at) return null;
    return {
      accessToken: at,
      refreshToken: this.getRefreshToken() || undefined,
      idToken: this.getIdToken() || undefined
    };
  }
  setTokens(tokens: CorporateTokens): void {
    if (tokens.accessToken) this.setAccessToken(tokens.accessToken);
    if (tokens.refreshToken) this.setRefreshToken(tokens.refreshToken);
    if (tokens.idToken) this.setIdToken(tokens.idToken);
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

export class SessionStorageTokenStorageAdapter implements TokenStorageAdapter {
  private readonly prefix: string;
  private readonly isBrowser: boolean;
  private readonly fallbackMemory = new InMemoryTokenStorageAdapter();

  constructor(prefix = 'rassini_auth') {
    this.prefix = prefix;
    this.isBrowser = typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return this.fallbackMemory.getAccessToken();
    return sessionStorage.getItem(`${this.prefix}_access_token`);
  }

  setAccessToken(token: string): void {
    if (!this.isBrowser) {
      this.fallbackMemory.setAccessToken(token);
      return;
    }
    sessionStorage.setItem(`${this.prefix}_access_token`, token);
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return this.fallbackMemory.getRefreshToken();
    return sessionStorage.getItem(`${this.prefix}_refresh_token`);
  }

  setRefreshToken(token: string): void {
    if (!this.isBrowser) {
      this.fallbackMemory.setRefreshToken(token);
      return;
    }
    sessionStorage.setItem(`${this.prefix}_refresh_token`, token);
  }

  getIdToken(): string | null {
    if (!this.isBrowser) return this.fallbackMemory.getIdToken();
    return sessionStorage.getItem(`${this.prefix}_id_token`);
  }

  setIdToken(token: string): void {
    if (!this.isBrowser) {
      this.fallbackMemory.setIdToken(token);
      return;
    }
    sessionStorage.setItem(`${this.prefix}_id_token`, token);
  }

  getTokens(): CorporateTokens | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;
    return {
      accessToken,
      refreshToken: this.getRefreshToken() || undefined,
      idToken: this.getIdToken() || undefined
    };
  }

  setTokens(tokens: CorporateTokens): void {
    if (tokens.accessToken) {
      this.setAccessToken(tokens.accessToken);
    }
    if (tokens.refreshToken) {
      this.setRefreshToken(tokens.refreshToken);
    }
    if (tokens.idToken) {
      this.setIdToken(tokens.idToken);
    }
  }

  clear(): void {
    if (!this.isBrowser) {
      this.fallbackMemory.clear();
      return;
    }
    sessionStorage.removeItem(`${this.prefix}_access_token`);
    sessionStorage.removeItem(`${this.prefix}_refresh_token`);
    sessionStorage.removeItem(`${this.prefix}_id_token`);
  }

  getItem(key: string): string | null {
    if (!this.isBrowser) return this.fallbackMemory.getItem(key);
    return sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.isBrowser) {
      this.fallbackMemory.setItem(key, value);
      return;
    }
    sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (!this.isBrowser) {
      this.fallbackMemory.removeItem(key);
      return;
    }
    sessionStorage.removeItem(key);
  }
}
