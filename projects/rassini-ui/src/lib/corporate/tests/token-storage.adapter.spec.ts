import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { SessionStorageTokenStorageAdapter, InMemoryTokenStorageAdapter } from '../storage/token-storage.adapter';

describe('Corporate SDK - Token Storage Adapters', () => {
  it('1. InMemoryTokenStorageAdapter almacena, recupera y limpia tokens', () => {
    const mem = new InMemoryTokenStorageAdapter();
    expect(mem.getAccessToken()).toBeNull();

    mem.setTokens({ accessToken: 'access_123', idToken: 'id_123' });
    expect(mem.getAccessToken()).toBe('access_123');
    expect(mem.getIdToken()).toBe('id_123');

    mem.setItem('custom_key', 'val');
    expect(mem.getItem('custom_key')).toBe('val');

    mem.clear();
    expect(mem.getAccessToken()).toBeNull();
    expect(mem.getIdToken()).toBeNull();
  });

  it('2. SessionStorageTokenStorageAdapter usa prefijo por aplicacion evitando colisiones', () => {
    const s1 = new SessionStorageTokenStorageAdapter('app_pagos');
    const s2 = new SessionStorageTokenStorageAdapter('app_rh');

    s1.setAccessToken('token_pagos');
    s2.setAccessToken('token_rh');

    expect(s1.getAccessToken()).toBe('token_pagos');
    expect(s2.getAccessToken()).toBe('token_rh');

    s1.clear();
    expect(s1.getAccessToken()).toBeNull();
    expect(s2.getAccessToken()).toBe('token_rh'); // El token de RH permanece intacto
  });
});
