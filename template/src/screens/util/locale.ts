import { locale } from 'expo-localization'

export enum Locale {
  ja = 'ja-JP',
  en = 'en-US'
}

export type LocaleLookup<TElement> = {
  [locale in Locale]: TElement
}

export function containsJapanese (text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) >= 0x3000) {
      return true
    }
  }
  return false
}

export function localeContent <TElement> (variants: LocaleLookup<TElement>, text: string): TElement {
  if (containsJapanese(text)) {
    return variants[Locale.ja]
  }
  return variants[Locale.en]
}

export function localized <TElement> (variants: LocaleLookup<TElement>): TElement {
  return variants[locale] ?? variants[Locale.en]
}
