import { Document, ColorAsset } from 'sketch/dom'
import { slugify, safeChildName } from '../util/string'
import { Imports, addImport, ITypeScript } from '../util/render'
import { getDesignName } from '../util/dom'

export type FGetColor = (color: string, imports?: Imports) => string

export function getColorFactory (document: Document): FGetColor {
  const lookup: { [color: string]: string } = {}
  const designName = getDesignName(document)
  document.colors.forEach(color => {
    if (isActiveColor(color)) {
      lookup[color.color] = nameForColor(color)
    }
  })
  return (color: string, imports?: Imports) => {
    const mappedColor = lookup[color]
    if (mappedColor === undefined) return `'${color}'`
    if (imports !== undefined) {
      addImport(imports, `./src/styles/${designName}/Color`, 'Color')
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

export function generateColors (document: Document): ITypeScript | undefined {
  const colors = document.colors.filter(color => isActiveColor(color))
  const designName = getDesignName(document)
  if (colors.length === 0) {
    return
  }
  return {
    pth: `./src/styles/${designName}/Color.ts`,
    imports: {},
    code: `export enum Color {
${colors.map(color => `  ${nameForColor(color)} = '${color.color}'`).join(',\n')}
}`
  }
}
