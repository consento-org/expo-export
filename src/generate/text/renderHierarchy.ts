import { Hierarchy } from '../../util/hierarchy'
import { TextFormat, ITextFormat } from './TextFormat'
import { Document } from 'sketch/dom'
import { toMaxDecimals } from '../../util/number'
import { FGetColor, getColorFactory } from '../color'
import { safeChildName } from '../../util/string'

function has<T = any> (entry: T | null | undefined): entry is T {
  return entry !== null && entry !== undefined
}

export function fontStyleName (stack: string[]): string {
  return safeChildName(stack.map(entry => entry.replace(/[ \t\r]/ig, '_')).join('_'))
}

function renderFormat (getColor: FGetColor, style: ITextFormat, stack: string[]): string {
  const props = []
  const hierarchy = []
  for (let i = 0; i < stack.length - 1; i++) {
    hierarchy.push(stack[i])
    props.push(`...${fontStyleName(hierarchy)}`)
  }
  if (has(style.color)) props.push(`color: ${getColor(style.color)}`)
  if (has(style.fontFamily)) props.push(`fontFamily: Font.${style.fontFamily}`)
  if (has(style.fontSize)) props.push(`fontSize: ${toMaxDecimals(style.fontSize, 2)}`)
  if (has(style.textAlign)) props.push(`textAlign: ETextAlign.${style.textAlign}`)
  if (has(style.textTransform)) props.push(`textTransform: ETextTransform.${style.textTransform}`)
  if (props.length === 0) {
    return `export const ${fontStyleName(stack)} = {}`
  }
  return `export const ${fontStyleName(stack)}: ITextStyle = {
  ${props.join(',\n  ')}
}`
}

export interface TIDLookup { [id: string]: string }

function _renderHierarchy (getColor: FGetColor, styles: Hierarchy<TextFormat>, stack: string[], entries: string[], textStyles: TIDLookup): void {
  for (const name in styles) {
    stack.push(name)
    const node = styles[name]
    textStyles[node.item !== undefined ? node.item.id : ((Math.random() * 0xFFFFFFFFFFFF) | 0).toString(32)] = fontStyleName(stack)
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
