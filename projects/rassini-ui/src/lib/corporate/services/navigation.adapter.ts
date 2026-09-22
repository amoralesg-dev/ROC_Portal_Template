import { Observable } from 'rxjs';
import { CorporateNavigationMenu, CorporateApplicationInfo } from '../models/corporate.models';
import { InjectionToken } from '@angular/core';

export interface NavigationAdapter {
  loadMenus(appCode: string): Observable<CorporateNavigationMenu[]>;
  loadApplications?(): Observable<CorporateApplicationInfo[]>;
}

export const NAVIGATION_ADAPTER = new InjectionToken<NavigationAdapter>('NAVIGATION_ADAPTER');
