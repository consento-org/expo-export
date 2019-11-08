import { Document, ColorAsset } from 'sketch/dom'
import { slugify, safeChildName } from '../util/string'
import { Imports, addImport } from '../util/render'
import { disclaimer } from './disclaimer'

export type FGetColor = (color: string, imports?: Imports) => string

export function getColorFactory (document: Document): FGetColor {
  const lookup: { [color: string]: string } = {}
  document.colors.forEach(color => {
    if (isActiveColor(color)) {
      lookup[color.color] = nameForColor(color)
    }
  })
  return (color: string, imports?: Imports) => {
    const mappedColor = lookup[color]
    if (mappedColor === undefined) return `'${color}'`
    if (imports !== undefined) {
      addImport(imports, 'src/styles/Color', 'Color')
    }
    return `Color.${lookup[color]}`
  }
}

export function isActiveColor (color: ColorAsset): boolean {
  return color.name !== undefined && color.name !== null && color.name !== ''
}

export function nameForColor (color: ColorAsset): string {
  return safeChildName(slugify(color.name, '_'))
}

export function generateColors (document: Document): string | undefined {
  const colors = document.colors.filter(color => isActiveColor(color))
  if (colors.length === 0) {
    return
  }
  return `${disclaimer}
export enum Color {
${colors.map(color => `  ${nameForColor(color)} = '${color.color}'`).join(',\n')}
}
`
}
