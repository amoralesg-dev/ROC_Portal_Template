export type SupportedLanguage = 'es-MX' | 'en-US';

export interface RassiniI18nDictionary {
  [key: string]: string | RassiniI18nDictionary;
}
