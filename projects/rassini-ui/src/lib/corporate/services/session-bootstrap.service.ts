import { Injectable, signal } from '@angular/core';
import { AuthenticationService, MissingApplicationCodeError } from './authentication.service';
import { NavigationService } from './navigation.service';
import { ContextService } from './context.service';
import { CorporateOidcConfig } from '../models/corporate.models';
import { lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface BootstrapOptions {
  failOnNavigationError?: boolean;
}

@Injectable()
export class SessionBootstrapService {
  readonly authReady = signal<boolean>(false);
  readonly contextReady = signal<boolean>(false);
  readonly navigationReady = signal<boolean>(false);
  readonly ready = signal<boolean>(false);

  readonly authError = signal<string | null>(null);
  readonly contextError = signal<string | null>(null);
  readonly navigationError = signal<string | null>(null);
  readonly bootstrapError = signal<string | null>(null);

  private initPromise: Promise<boolean> | null = null;

  constructor(
    private readonly authService: AuthenticationService,
    private readonly navigationService: NavigationService,
    private readonly contextService: ContextService
  ) {}

  initialize(config: CorporateOidcConfig, options: BootstrapOptions = { failOnNavigationError: false }): Promise<boolean> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.executeBootstrap(config, options);
    return this.initPromise;
  }

  private async executeBootstrap(config: CorporateOidcConfig, options: BootstrapOptions): Promise<boolean> {
    // 0. Validar obligatoriedad de applicationCode en modo OIDC corporativo
    if (!config || !config.applicationCode || config.applicationCode.trim() === '') {
      const err = new MissingApplicationCodeError();
      this.bootstrapError.set(err.message);
      this.authError.set(err.message);
      return false;
    }

    try {
      this.authService.setConfig(config);
    } catch (e: any) {
      this.bootstrapError.set(e.message);
      this.authError.set(e.message);
      return false;
    }

    // 1. Process Callback if URL contains authorization code
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        try {
          await lastValueFrom(this.authService.handleCallback(code, state));
          this.authReady.set(true);
        } catch (err: any) {
          this.authError.set(err.message || 'OAuth2 callback processing failed');
          this.bootstrapError.set(this.authError());
          return false;
        }
      }
    }

    // 2. Restore Session from storage if not already authenticated
    if (!this.authService.isAuthenticated()) {
      const restored = this.authService.restoreSession();
      if (restored) {
        this.authReady.set(true);
      } else {
        this.authReady.set(false);
        this.ready.set(false);
        return false;
      }
    } else {
      this.authReady.set(true);
    }

    // 3. Initialize Context
    try {
      this.contextReady.set(true);
    } catch (err: any) {
      this.contextError.set(err.message || 'Context resolution failed');
    }

    // 4. Load Navigation (Decoupled & Non-blocking by default)
    try {
      await lastValueFrom(
        this.navigationService.loadNavigation().pipe(
          catchError(err => {
            this.navigationError.set(err.message || 'Failed to load navigation');
            return of([]);
          })
        )
      );
      this.navigationReady.set(true);
    } catch (err: any) {
      this.navigationError.set(err.message || 'Navigation error');
      if (options.failOnNavigationError) {
        this.bootstrapError.set(this.navigationError());
        return false;
      }
    }

    this.ready.set(true);
    return true;
  }
}
