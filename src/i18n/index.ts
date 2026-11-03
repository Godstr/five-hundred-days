import { createStore } from '../lib/store'
import { STRINGS, type StringKey } from './strings'

export type Lang = 'en' | 'mn'
export const LANGS: Lang[] = ['en', 'mn']
export const LOCALES: Record<Lang, string> = { en: 'en-US', mn: 'mn-MN' }

/** Text that differs per language. A plain value is used for both. */
export type L<T = string> = T | { en: T; mn: T }

const STORAGE_KEY = 'five-hundred-days:lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'mn') return saved
  } catch {
    /* private mode */
  }
  return navigator.language?.toLowerCase().startsWith('mn') ? 'mn' : 'en'
}

export const i18n = createStore({ lang: initialLang() })
document.documentElement.lang = i18n.get().lang

export function setLang(lang: Lang) {
  i18n.set({ lang })
  document.documentElement.lang = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* private mode: the choice lasts for this visit */
  }
}

function isLocalized<T>(value: L<T>): value is { en: T; mn: T } {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'en' in value && 'mn' in value
}

/** Picks the current language from a config value. */
export function tx<T>(value: L<T>, lang: Lang = i18n.get().lang): T {
  return isLocalized(value) ? value[lang] : value
}

/** A UI string, with {placeholders} filled in. */
export function t(key: StringKey, vars?: Record<string, string | number>, lang: Lang = i18n.get().lang): string {
  let text: string = STRINGS[key][lang]
  if (vars) for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value))
  return text
}

/** Subscribes the component to language changes and returns translators bound to the current language. */
export function useI18n() {
  const lang = i18n.use((s) => s.lang)
  return {
    lang,
    t: (key: StringKey, vars?: Record<string, string | number>) => t(key, vars, lang),
    tx: <T,>(value: L<T>) => tx(value, lang),
  }
}
