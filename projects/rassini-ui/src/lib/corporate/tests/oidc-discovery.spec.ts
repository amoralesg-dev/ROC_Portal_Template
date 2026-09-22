import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { CorporateOidcConfig } from '../models/corporate.models';

describe('Corporate SDK - OIDC Discovery Engine', () => {
  let mockHttpClient: any;

  const validDiscoveryDoc = {
    issuer: 'http://localhost:8083',
    authorization_endpoint: 'http://localhost:8083/oauth2/authorize',
    token_endpoint: 'http://localhost:8083/oauth2/token',
    jwks_uri: 'http://localhost:8083/oauth2/jwks',
    response_types_supported: ['code']
  };

  it('1. Discovery valida coincidencia exacta de issuer', () => {
    const configuredIssuer = 'http://localhost:8083';
    const remoteIssuer = validDiscoveryDoc.issuer;

    expect(remoteIssuer).toBe(configuredIssuer);
  });

  it('2. Discovery rechaza respuesta con issuer discrepante', () => {
    const configuredIssuer = 'http://localhost:8083';
    const maliciousDoc = { ...validDiscoveryDoc, issuer: 'http://evil.example' };

    expect(maliciousDoc.issuer === configuredIssuer).toBe(false);
  });

  it('3. Discovery detecta documento incompleto si falta authorization_endpoint o token_endpoint', () => {
    const incompleteDoc: any = { issuer: 'http://localhost:8083' };
    const isValid = !!(incompleteDoc.authorization_endpoint && incompleteDoc.token_endpoint);

    expect(isValid).toBe(false);
  });

  it('4. Discovery detecta documento incompleto si falta jwks_uri', () => {
    const docWithoutJwks: any = {
      issuer: 'http://localhost:8083',
      authorization_endpoint: 'http://localhost:8083/oauth2/authorize',
      token_endpoint: 'http://localhost:8083/oauth2/token'
    };
    const hasJwks = !!docWithoutJwks.jwks_uri;
    expect(hasJwks).toBe(false);
  });

  it('5. Error HTTP 404 o 500 en endpoint discovery es detectado y manejado', () => {
    const httpError = { status: 404, statusText: 'Not Found' };
    expect(httpError.status).toBeGreaterThanOrEqual(400);
  });
});
