import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Directive({
  selector: '[rassiniHasRole]',
  standalone: true
})
export class RassiniHasRoleDirective {
  private readonly authService = inject(AuthenticationService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private requiredRole: string = '';
  private hasView = false;

  @Input() set rassiniHasRole(role: string) {
    this.requiredRole = role;
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.authService.roles();
      this.updateView();
    });
  }

  private updateView(): void {
    const isGranted = this.authService.hasRole(this.requiredRole);
    if (isGranted && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isGranted && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

@Directive({
  selector: '[rassiniHasPermission]',
  standalone: true
})
export class RassiniHasPermissionDirective {
  private readonly authService = inject(AuthenticationService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private requiredPermission: string = '';
  private hasView = false;

  @Input() set rassiniHasPermission(permission: string) {
    this.requiredPermission = permission;
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.authService.permissions();
      this.updateView();
    });
  }

  private updateView(): void {
    const isGranted = this.authService.hasPermission(this.requiredPermission);
    if (isGranted && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isGranted && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

@Directive({
  selector: '[rassiniHasBusinessUnit]',
  standalone: true
})
export class RassiniHasBusinessUnitDirective {
  private readonly authService = inject(AuthenticationService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  private requiredBu: string = '';
  private hasView = false;

  @Input() set rassiniHasBusinessUnit(buCode: string) {
    this.requiredBu = buCode;
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.authService.businessUnits();
      this.authService.hasAllBusinessUnits();
      this.updateView();
    });
  }

  private updateView(): void {
    const isGranted = this.authService.hasBusinessUnit(this.requiredBu);
    if (isGranted && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isGranted && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

@Directive({
  selector: '[rassiniAuthenticated]',
  standalone: true
})
export class RassiniAuthenticatedDirective {
  private readonly authService = inject(AuthenticationService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private hasView = false;

  constructor() {
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      if (isAuth && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!isAuth && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}

@Directive({
  selector: '[rassiniAnonymous]',
  standalone: true
})
export class RassiniAnonymousDirective {
  private readonly authService = inject(AuthenticationService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private hasView = false;

  constructor() {
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      if (!isAuth && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (isAuth && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
