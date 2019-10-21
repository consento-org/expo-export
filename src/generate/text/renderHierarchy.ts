import { Hierarchy } from '../../util/hierarchy'
import { TextFormat, ITextFormat } from './TextFormat'
import { Document } from 'sketch/dom'
import { toMaxDecimals } from '../../util/number'

type FGetColor = (color: string) => string

function getColorFactory (document: Document): FGetColor {
  const lookup: { [color: string]: string } = {}
  document.colors.forEach(color => {
    lookup[color.color] = color.name
  })
  return (color: string) => {
    const mappedColor = lookup[color]
    if (mappedColor === undefined) return `'${color}'`
    return `Color.${lookup[color]}`
  }
}
function has<T = any> (entry: T | null | undefined): entry is T {
  return entry !== null && entry !== undefined
}

function renderFormat (getColor: FGetColor, style: ITextFormat, stack: string[]): string {
  const props = []
  const hierarchy = []
  for (let i = 0; i < stack.length - 1; i++) {
    hierarchy.push(stack[i])
    props.push(`...${hierarchy.join('_')}`)
  }
  if (has(style.color)) props.push(`color: ${getColor(style.color)}`)
  if (has(style.fontFamily)) props.push(`fontFamily: Font.${style.fontFamily}`)
  if (has(style.fontSize)) props.push(`fontSize: ${toMaxDecimals(style.fontSize, 2)}`)
  if (has(style.textAlign)) props.push(`textAlign: '${style.textAlign}'`)
  if (has(style.textTransform)) props.push(`textTransform: '${style.textTransform}'`)
  if (props.length === 0) {
    return `export const ${stack.join('_')} = {}`
  }
  return `export const ${stack.join('_')} = {
  ${props.join(',\n  ')}
}`
}

export type TIDLookup = { [id: string]: string }

function _renderHierarchy (getColor: FGetColor, styles: Hierarchy<TextFormat>, stack: string[], entries: string[], textStyles: TIDLookup): void {
  for (const name in styles) {
    stack.push(name)
    const node = styles[name]
    textStyles[node.item !== undefined ? node.item.id : ((Math.random() * 0xFFFFFFFFFFFF) | 0).toString(32)] = stack.join('_')
    entries.push(
      node.item !== undefined ? renderFormat(getColor, node.item, stack) : renderFormat(getColor, {}, stack)
    )
    _renderHierarchy(getColor, node.children, stack, entries, textStyles)
    stack.pop()
  }
}

export function renderHierarchy (document: Document, styles: Hierarchy<TextFormat>): {
  entries: string[]
  textStyles: TIDLookup
} {
  const getColor = getColorFactory(document)
  const textStyles: TIDLookup = {}
  const entries: string[] = []
  _renderHierarchy(getColor, styles, [], entries, textStyles)
  return {
    entries,
    textStyles
  }
}
