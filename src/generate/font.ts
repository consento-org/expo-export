import { Document } from 'sketch/dom'
import { disclaimer } from './disclaimer'

export function fontShortID (fontFamily: string): string {
  return fontFamily.replace(/ |-/ig, '')
}

export function generateFonts (document: Document, fontName: (id: string) => string): string {
  const fontMap: { [key: string]: boolean } = {}

  document.sharedTextStyles.forEach((style) => {
    fontMap[fontName(style.id)] = true
  })

  const fonts = Object.keys(fontMap)

  return `${disclaimer}
import * as ExpoFont from 'expo-font'

export enum Font {
${fonts.map((font) => `  ${fontShortID(font)} = '${font}'`).join(',\n')}
}

export async function loadFonts (): Promise<void> {
  await ExpoFont.loadAsync({
${fonts.map((font) => `    [Font.${fontShortID(font)}]: require('../../assets/fonts/${font}.ttf')`).join(',\n')}
  })
}
`
}
