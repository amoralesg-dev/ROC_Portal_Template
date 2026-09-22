import { CorporateOidcConfig } from '../models/corporate.models';
import { Observable, of } from 'rxjs';

export interface CorporateConfigurationAdapter {
  loadConfig(): Observable<CorporateOidcConfig>;
}

export class StaticCorporateConfigurationAdapter implements CorporateConfigurationAdapter {
  constructor(private readonly config: CorporateOidcConfig) {}

  loadConfig(): Observable<CorporateOidcConfig> {
    return of(this.config);
  }
}

export class EnvironmentCorporateConfigurationAdapter implements CorporateConfigurationAdapter {
  constructor(private readonly envGetter: () => CorporateOidcConfig) {}

  loadConfig(): Observable<CorporateOidcConfig> {
    return of(this.envGetter());
  }
}
