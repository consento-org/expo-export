import { Document } from 'sketch/dom'
import { ITypeScript, isFilled } from '../util/render'
import { getDesignName } from '../util/dom'

export function fontShortID (fontFamily: string): string {
  return fontFamily.replace(/ |-/ig, '')
}

export function generateFonts (document: Document, fontName: (id: string) => string): ITypeScript {
  const fontMap: { [key: string]: boolean } = {}

  document.sharedTextStyles.forEach((style) => {
    fontMap[fontName(style.id)] = true
  })

  if (!isFilled(fontMap)) {
    return
  }

  const fonts = Object.keys(fontMap)
  const designName = getDesignName(document)
  return {
    pth: `./src/styles/${designName}/Font.ts`,
    imports: {},
    code: `import * as ExpoFont from 'expo-font'

export enum Font {
${fonts.map((font) => `  ${fontShortID(font)} = '${font}'`).join(',\n')}
}

export async function loadFonts (): Promise<void> {
  await ExpoFont.loadAsync({
${fonts.map((font) => `    [Font.${fontShortID(font)}]: require('../../../assets/fonts/${font}.ttf')`).join(',\n')}
  })
}
`
  }
}
