import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { 
  StaticCorporateConfigurationAdapter, 
  EnvironmentCorporateConfigurationAdapter 
} from '../config/configuration.adapter';
import { CorporateOidcConfig } from '../models/corporate.models';

describe('Corporate SDK - Configuration Adapters', () => {
  const sampleConfig: CorporateOidcConfig = {
    issuer: 'https://iam.rassini.com',
    clientId: 'ms-pagos-client',
    redirectUri: 'https://pagos.rassini.com/callback',
    applicationCode: 'MS_PAGOS',
    allowedApiOrigins: ['https://iam.rassini.com', 'https://api.pagos.rassini.com']
  };

  it('1. StaticCorporateConfigurationAdapter retorna la configuracion estatica provista', async () => {
    const adapter = new StaticCorporateConfigurationAdapter(sampleConfig);
    const loaded = await new Promise<CorporateOidcConfig>(resolve => {
      adapter.loadConfig().subscribe(resolve);
    });

    expect(loaded).toEqual(sampleConfig);
    expect(loaded.applicationCode).toBe('MS_PAGOS');
  });

  it('2. EnvironmentCorporateConfigurationAdapter invoca el getter dinamico de entorno', async () => {
    let dynamicPort = '8083';
    const adapter = new EnvironmentCorporateConfigurationAdapter(() => ({
      ...sampleConfig,
      issuer: `http://localhost:${dynamicPort}`
    }));

    const config1 = await new Promise<CorporateOidcConfig>(r => adapter.loadConfig().subscribe(r));
    expect(config1.issuer).toBe('http://localhost:8083');

    dynamicPort = '8084';
    const config2 = await new Promise<CorporateOidcConfig>(r => adapter.loadConfig().subscribe(r));
    expect(config2.issuer).toBe('http://localhost:8084');
  });
});
