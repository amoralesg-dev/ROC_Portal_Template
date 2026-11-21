import { Injectable, signal, computed } from '@angular/core';
import { SupportedLanguage, RassiniI18nDictionary } from './i18n.models';
import { ES_MX_DICTIONARY } from './locales/es-mx';
import { EN_US_DICTIONARY } from './locales/en-us';

@Injectable({
  providedIn: 'root'
})
export class RassiniI18nService {
  readonly currentLang = signal<SupportedLanguage>('es-MX');

  private dictionaries: Record<SupportedLanguage, RassiniI18nDictionary> = {
    'es-MX': JSON.parse(JSON.stringify(ES_MX_DICTIONARY)),
    'en-US': JSON.parse(JSON.stringify(EN_US_DICTIONARY))
  };

  /**
   * Adapter opcional para resolver traducciones desde un motor externo (ej. @ngx-translate/core).
   * Firma: (key: string, lang: SupportedLanguage) => string | undefined
   */
  private externalResolver?: (key: string, lang: SupportedLanguage) => string | undefined;

  constructor() {
    this.detectInitialLanguage();
  }

  /**
   * Normaliza un código de idioma arbitrario ('es', 'es-MX', 'en', 'en-US', etc.) a SupportedLanguage.
   * Default institucional: 'es-MX'.
   */
  normalizeLanguage(lang?: string | null): SupportedLanguage {
    if (!lang) return 'es-MX';
    const lower = lang.toLowerCase().trim();
    if (lower.startsWith('en')) {
      return 'en-US';
    }
    if (lower.startsWith('es')) {
      return 'es-MX';
    }
    return 'es-MX';
  }

  /**
   * Detecta el idioma inicial según la prioridad:
   * 1. localStorage 'rassini_language'
   * 2. navigator.language
   * 3. 'es-MX'
   */
  private detectInitialLanguage(): void {
    if (typeof window === 'undefined') {
      this.currentLang.set('es-MX');
      return;
    }

    try {
      const stored = localStorage.getItem('rassini_language');
      if (stored) {
        this.currentLang.set(this.normalizeLanguage(stored));
        return;
      }
    } catch {
      // Ignorar error de acceso a storage
    }

    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'es-MX';
    this.currentLang.set(this.normalizeLanguage(browserLang));
  }

  /**
   * Cambia el idioma activo y lo normaliza.
   */
  setLanguage(lang: string): void {
    const normalized = this.normalizeLanguage(lang);
    this.currentLang.set(normalized);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('rassini_language', normalized);
      }
    } catch {
      // Ignorar error
    }
  }

  /**
   * Registra un resolver externo (ej. para apps que usan ngx-translate o JSONs propios).
   */
  setExternalResolver(resolver: (key: string, lang: SupportedLanguage) => string | undefined): void {
    this.externalResolver = resolver;
  }

  /**
   * Registra o sobreescribe traducciones adicionales en un idioma específico.
   */
  registerTranslations(lang: string, dictionary: RassiniI18nDictionary): void {
    const normalized = this.normalizeLanguage(lang);
    this.dictionaries[normalized] = this.deepMerge(this.dictionaries[normalized], dictionary);
  }

  /**
   * Traduce una clave jerárquica ('rassini.shell.profile') con fallback a es-MX y defaultValue.
   */
  translate(key: string, defaultValue?: string): string {
    const lang = this.currentLang();

    // 1. Intentar con resolver externo si está configurado
    if (this.externalResolver) {
      const externalVal = this.externalResolver(key, lang);
      if (externalVal && externalVal !== key) {
        return externalVal;
      }
    }

    // 2. Idioma activo en diccionarios internos
    const activeVal = this.getNestedValue(this.dictionaries[lang], key);
    if (activeVal !== undefined && typeof activeVal === 'string') {
      return activeVal;
    }

    // 3. Fallback a es-MX si el idioma activo no es es-MX
    if (lang !== 'es-MX') {
      if (this.externalResolver) {
        const fallbackExt = this.externalResolver(key, 'es-MX');
        if (fallbackExt && fallbackExt !== key) {
          return fallbackExt;
        }
      }
      const fallbackVal = this.getNestedValue(this.dictionaries['es-MX'], key);
      if (fallbackVal !== undefined && typeof fallbackVal === 'string') {
        return fallbackVal;
      }
    }

    // 4. Default value provisto o clave original
    return defaultValue !== undefined ? defaultValue : key;
  }

  /**
   * Resuelve la etiqueta visible de un ítem de menú a partir de su code estable y su fallback label.
   * Orden estricto:
   * 1. Clave en idioma activo: `menu.${code}`
   * 2. Clave en fallback es-MX: `menu.${code}`
   * 3. fallbackLabel provisto (enviado por IAM)
   * NUNCA devuelve "menu.CXP_PENDIENTES" al usuario.
   */
  resolveMenuLabel(code?: string | null, fallbackLabel?: string | null): string {
    const fallback = fallbackLabel || code || '';
    if (!code || !code.trim()) {
      return fallback;
    }

    const key = `menu.${code.trim()}`;
    const translated = this.translate(key, '');
    if (translated && translated.trim() !== '' && translated !== key) {
      return translated;
    }

    return fallback;
  }

  private getNestedValue(obj: any, path: string): string | undefined {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    return typeof current === 'string' ? current : undefined;
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  private isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
