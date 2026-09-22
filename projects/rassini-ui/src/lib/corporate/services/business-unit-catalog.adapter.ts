import { Observable } from 'rxjs';
import { CorporateBusinessUnit } from '../models/corporate.models';
import { InjectionToken } from '@angular/core';

export interface BusinessUnitCatalogAdapter {
  loadCatalog(): Observable<CorporateBusinessUnit[]>;
}

export const BUSINESS_UNIT_CATALOG_ADAPTER = new InjectionToken<BusinessUnitCatalogAdapter>('BUSINESS_UNIT_CATALOG_ADAPTER');

export class MissingBusinessUnitCatalogError extends Error {
  constructor() {
    super('No BusinessUnitCatalogAdapter available to validate business units for global user (hasAllBusinessUnits=true). Fail closed.');
    this.name = 'MissingBusinessUnitCatalogError';
  }
}

export class UnauthorizedBusinessUnitError extends Error {
  constructor(buCode: string) {
    super(`Business unit ${buCode} is not in authorized units or trusted catalog.`);
    this.name = 'UnauthorizedBusinessUnitError';
  }
}
