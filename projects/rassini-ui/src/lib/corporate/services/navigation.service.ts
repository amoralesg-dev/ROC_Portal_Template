import { Injectable, signal, Inject } from '@angular/core';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { CorporateNavigationMenu, CorporateApplicationInfo } from '../models/corporate.models';
import { NavigationAdapter, NAVIGATION_ADAPTER } from './navigation.adapter';
import { AuthenticationService } from './authentication.service';
import { ContextService } from './context.service';

@Injectable()
export class NavigationService {
  readonly menus = signal<CorporateNavigationMenu[]>([]);
  readonly applications = signal<CorporateApplicationInfo[]>([]);
  readonly loading = signal<boolean>(false);
  readonly loaded = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor(
    @Inject(NAVIGATION_ADAPTER) private adapter: NavigationAdapter,
    private readonly authService: AuthenticationService,
    private readonly contextService: ContextService
  ) {}

  setAdapter(adapter: NavigationAdapter): void {
    this.adapter = adapter;
  }

  loadNavigation(appCode?: string): Observable<CorporateNavigationMenu[]> {
    const targetApp = appCode || this.authService.getConfig()?.applicationCode || '';
    this.loading.set(true);
    this.error.set(null);

    return this.adapter.loadMenus(targetApp).pipe(
      map(items => this.resolveMenuUrls(items)),
      tap({
        next: resolved => {
          this.menus.set(resolved);
          this.loaded.set(true);
          this.loading.set(false);
        },
        error: err => {
          this.error.set(err.message || 'Error loading navigation');
          this.loading.set(false);
        }
      })
    );
  }

  private resolveMenuUrls(items: CorporateNavigationMenu[]): CorporateNavigationMenu[] {
    return items.map(item => {
      const copy: CorporateNavigationMenu = { ...item };
      if (copy.externalUrl) {
        try {
          copy.resolvedUrl = this.contextService.resolvePlaceholders(copy.externalUrl, { strict: false });
        } catch {
          copy.resolvedUrl = copy.externalUrl;
        }
      }
      if (copy.children && copy.children.length > 0) {
        copy.children = this.resolveMenuUrls(copy.children);
      }
      return copy;
    });
  }

  findMenuItemByRoute(route: string): CorporateNavigationMenu | null {
    const search = (items: CorporateNavigationMenu[]): CorporateNavigationMenu | null => {
      for (const item of items) {
        if (item.route === route) return item;
        if (item.children && item.children.length > 0) {
          const found = search(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(this.menus());
  }

  getFlatMenus(): CorporateNavigationMenu[] {
    const flat: CorporateNavigationMenu[] = [];
    const traverse = (items: CorporateNavigationMenu[]) => {
      for (const item of items) {
        flat.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      }
    };
    traverse(this.menus());
    return flat;
  }

  clear(): void {
    this.menus.set([]);
    this.applications.set([]);
    this.loading.set(false);
    this.loaded.set(false);
    this.error.set(null);
  }
}
