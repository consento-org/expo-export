import { Document, ColorAsset } from 'sketch/dom'
import { slugify } from '../util/string'
import { Imports, addImport } from '../util/render'

export type FGetColor = (color: string, imports?: Imports) => string

export function getColorFactory (document: Document): FGetColor {
  const lookup: { [color: string]: string } = {}
  document.colors.forEach(color => {
    if (isActiveColor(color)) {
      lookup[color.color] = color.name
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

export function generateColors (document: Document): string | undefined {
  const colors = document.colors.filter(color => isActiveColor(color))
  return `export enum Color {
${colors.map(color => `  ${slugify(color.name, '_')} = '${color.color}'`).join(',\n')}
}
`
}
