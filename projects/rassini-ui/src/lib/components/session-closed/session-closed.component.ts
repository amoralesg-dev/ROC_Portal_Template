import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RassiniI18nService } from '../../i18n';

/**
 * Componente corporativo reutilizable para mostrar la pantalla de Sesión Cerrada (Post-Logout).
 * 
 * Encapsula la presentación visual, iconografía, títulos, descripciones y botón de retorno
 * hacia el portal corporativo, con soporte completo de internacionalización (es-MX / en-US).
 * 
 * NO contiene lógica de seguridad (invalidation, tokens, cookies, etc.), la cual debe ejecutarse
 * en el contenedor/página de logout antes o durante el montaje.
 */
@Component({
  selector: 'rui-session-closed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rui-session-closed-container">
      <div class="rui-session-closed-card">
        <div class="rui-session-closed-icon-wrapper">
          <i class="pi pi-check-circle rui-session-closed-icon"></i>
        </div>

        <h2 class="rui-session-closed-title">{{ displayTitle }}</h2>

        <p class="rui-session-closed-desc">
          {{ displayDescription }}
        </p>

        @if (showReturnButton) {
          <button 
            type="button"
            id="btn-portal-login"
            class="rui-session-closed-btn"
            (click)="onReturnClick()">
            <i class="pi pi-sign-in"></i> {{ displayButtonText }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .rui-session-closed-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
      background: #f8fafc;
      padding: 2rem;
      box-sizing: border-box;
    }

    .rui-session-closed-card {
      background: white;
      padding: 3rem 2.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      max-width: 460px;
      width: 100%;
      border: 1px solid #e2e8f0;
      box-sizing: border-box;
    }

    .rui-session-closed-icon-wrapper {
      width: 72px;
      height: 72px;
      background: #ecfdf5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem auto;
    }

    .rui-session-closed-icon {
      font-size: 38px;
      color: #10b981;
    }

    .rui-session-closed-title {
      margin: 0 0 0.75rem 0;
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .rui-session-closed-desc {
      color: #64748b;
      font-size: 1rem;
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .rui-session-closed-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 0.85rem 1.5rem;
      background: #ea580c;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }

    .rui-session-closed-btn:hover {
      background: #c2410c;
    }

    .rui-session-closed-btn:active {
      transform: scale(0.99);
    }
  `]
})
export class RassiniSessionClosedComponent {
  private readonly i18n = inject(RassiniI18nService, { optional: true });

  @Input()
  title?: string;

  @Input()
  description?: string;

  @Input()
  buttonText?: string;

  @Input()
  showReturnButton = true;

  @Output()
  returnClick = new EventEmitter<void>();

  t(key: string, defaultValue: string): string {
    return this.i18n ? this.i18n.translate(key, defaultValue) : defaultValue;
  }

  get displayTitle(): string {
    return this.title ?? this.t('rassini.sessionClosed.title', 'Sesión cerrada correctamente');
  }

  get displayDescription(): string {
    return this.description ?? this.t('rassini.sessionClosed.description', 'Gracias por utilizar la Plataforma Corporativa Rassini.');
  }

  get displayButtonText(): string {
    return this.buttonText ?? this.t('rassini.sessionClosed.goToPortal', 'Ir al Portal de Empleados');
  }

  onReturnClick(): void {
    this.returnClick.emit();
  }
}
