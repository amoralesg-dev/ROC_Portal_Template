import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { MissingContextPlaceholderError, CorporateBusinessUnit, CorporateUser } from '../models/corporate.models';

export type PlaceholderEncoding = 'RAW' | 'PATH_SEGMENT' | 'QUERY_PARAM';

export interface ContextPlaceholderOptions {
  strict?: boolean;
  encoding?: PlaceholderEncoding;
}

@Injectable()
export class ContextService {
  readonly activeBusinessUnit: WritableSignal<CorporateBusinessUnit | null>;
  readonly businessUnits: WritableSignal<CorporateBusinessUnit[]>;
  readonly hasAllBusinessUnits: WritableSignal<boolean>;
  readonly currentUser: WritableSignal<CorporateUser | null>;
  readonly hasActiveBusinessUnit: Signal<boolean>;

  constructor(private readonly authService: AuthenticationService) {
    this.activeBusinessUnit = this.authService.activeBusinessUnit;
    this.businessUnits = this.authService.businessUnits;
    this.hasAllBusinessUnits = this.authService.hasAllBusinessUnits;
    this.currentUser = this.authService.currentUser;
    this.hasActiveBusinessUnit = computed(() => !!this.activeBusinessUnit());
  }

  setActiveBusinessUnit(bu: CorporateBusinessUnit): void {
    this.authService.setActiveBusinessUnit(bu);
  }

  resolvePlaceholders(template: string, options: ContextPlaceholderOptions = { strict: true, encoding: 'RAW' }): string {
    const strict = options.strict ?? true;
    const encoding = options.encoding ?? 'RAW';
    const user = this.currentUser();
    const activeBu = this.activeBusinessUnit();
    const appCode = this.authService.getConfig()?.applicationCode || '';

    return template.replace(/\$\{([A-Z_]+)\}/g, (match, placeholder) => {
      let rawValue: string | null = null;

      switch (placeholder) {
        case 'BUSINESS_UNIT':
          if (activeBu) {
            rawValue = activeBu.code;
          } else if (strict) {
            throw new MissingContextPlaceholderError('BUSINESS_UNIT');
          } else {
            rawValue = '';
          }
          break;

        case 'BUSINESS_UNITS':
          if (user) {
            rawValue = user.businessUnits.map(b => b.code).join(',');
          } else if (strict) {
            throw new MissingContextPlaceholderError('BUSINESS_UNITS');
          } else {
            rawValue = '';
          }
          break;

        case 'USER_ID':
          if (user && user.userId) {
            rawValue = user.userId.toString();
          } else if (strict) {
            throw new MissingContextPlaceholderError('USER_ID');
          } else {
            rawValue = '';
          }
          break;

        case 'EMPLOYEE_ID':
          if (user && user.employeeId) {
            rawValue = user.employeeId;
          } else if (strict) {
            throw new MissingContextPlaceholderError('EMPLOYEE_ID');
          } else {
            rawValue = '';
          }
          break;

        case 'USERNAME':
          if (user && user.username) {
            rawValue = user.username;
          } else if (strict) {
            throw new MissingContextPlaceholderError('USERNAME');
          } else {
            rawValue = '';
          }
          break;

        case 'EMAIL':
          if (user && user.email) {
            rawValue = user.email;
          } else if (strict) {
            throw new MissingContextPlaceholderError('EMAIL');
          } else {
            rawValue = '';
          }
          break;

        case 'APPLICATION_CODE':
          rawValue = appCode;
          break;

        default:
          if (strict) {
            throw new MissingContextPlaceholderError(placeholder);
          }
          return match;
      }

      if (rawValue === null) return '';

      switch (encoding) {
        case 'PATH_SEGMENT':
          return encodeURIComponent(rawValue);
        case 'QUERY_PARAM':
          return encodeURIComponent(rawValue);
        case 'RAW':
        default:
          return rawValue;
      }
    });
  }
}
