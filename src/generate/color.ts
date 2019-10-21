import { Document } from 'sketch/dom'

export function generateColors (document: Document): string {
  return `export enum Color {
${document.colors.map((color) => `  ${color.name} = '${color.color}'`).join(',\n')}
}
`
}
