import { EnvironmentProviders, Provider, makeEnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CorporateOidcConfig } from '../models/corporate.models';
import { AuthenticationService } from '../services/authentication.service';
import { NavigationService } from '../services/navigation.service';
import { HttpNavigationAdapter } from '../services/http-navigation.adapter';
import { NavigationAdapter, NAVIGATION_ADAPTER } from '../services/navigation.adapter';
import { ContextService } from '../services/context.service';
import { SessionBootstrapService } from '../services/session-bootstrap.service';
import { rassiniTokenInterceptor } from '../interceptors/rassini-token.interceptor';
import { TokenStorageAdapter, SessionStorageTokenStorageAdapter } from '../storage/token-storage.adapter';
import { BusinessUnitCatalogAdapter, BUSINESS_UNIT_CATALOG_ADAPTER } from '../services/business-unit-catalog.adapter';

export interface RassiniCorporateProvidersConfig {
  oidc: CorporateOidcConfig;
  storageAdapter?: TokenStorageAdapter;
  navigationAdapter?: Provider;
  businessUnitCatalogAdapter?: Provider;
  failOnNavigationError?: boolean;
}

export function provideRassiniCorporate(config: RassiniCorporateProvidersConfig): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    MessageService,
    ConfirmationService,
    AuthenticationService,
    NavigationService,
    ContextService,
    SessionBootstrapService,
    HttpNavigationAdapter,
    config.navigationAdapter ?? {
      provide: NAVIGATION_ADAPTER,
      useClass: HttpNavigationAdapter
    },
    provideHttpClient(
      withInterceptors([rassiniTokenInterceptor])
    ),
    provideAppInitializer(async () => {
      const authService = inject(AuthenticationService);
      const bootstrapService = inject(SessionBootstrapService);

      if (config.storageAdapter) {
        authService.setStorageAdapter(config.storageAdapter);
      } else {
        const appCode = config.oidc && config.oidc.applicationCode ? config.oidc.applicationCode : 'app';
        authService.setStorageAdapter(new SessionStorageTokenStorageAdapter(`rassini_${appCode}`));
      }

      await bootstrapService.initialize(config.oidc, {
        failOnNavigationError: config.failOnNavigationError ?? false
      });
    })
  ];

  if (config.businessUnitCatalogAdapter) {
    providers.push(config.businessUnitCatalogAdapter);
  }

  return makeEnvironmentProviders(providers);
}
