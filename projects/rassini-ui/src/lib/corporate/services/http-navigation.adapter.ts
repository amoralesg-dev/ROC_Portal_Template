import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CorporateNavigationMenu, CorporateApplicationInfo } from '../models/corporate.models';
import { NavigationAdapter } from './navigation.adapter';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class HttpNavigationAdapter implements NavigationAdapter {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthenticationService
  ) {}

  loadMenus(appCode: string): Observable<CorporateNavigationMenu[]> {
    const config = this.authService.getConfig();
    const baseUrl = config?.issuer || '';
    // Consumir el endpoint de contexto autenticado /api/v1/auth/me disponible en el backend corporativo
    const url = `${baseUrl}/api/v1/auth/me`;
    return this.http.get<any>(url).pipe(
      map(res => {
        if (res && res.menus) {
          return res.menus as CorporateNavigationMenu[];
        }
        return [];
      })
    );
  }

  loadApplications(): Observable<CorporateApplicationInfo[]> {
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}
