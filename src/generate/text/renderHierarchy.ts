import { Hierarchy } from '../../util/hierarchy'
import { TextFormat, ITextFormat, TAlignment } from './TextFormat'
import { Document } from 'sketch/dom'
import { toMaxDecimals } from '../../util/number'
import { FGetColor, getColorFactory } from '../color'
import { safeChildName } from '../../util/string'

function has<T = any> (entry: T | null | undefined): entry is T {
  return entry !== null && entry !== undefined
}

export function fontStyleName (stack: StackEntry[]): string {
  return safeChildName(stack.map(entry => entry.name.replace(/[ \t\r]/ig, '_')).join('_'))
}

export function adjustAlignment (alignment: TAlignment): 'left' | 'right' | 'center' | 'justify' {
  if (alignment === 'justified') {
    return 'justify'
  }
  return alignment
}

function reduceStack (stack: StackEntry[]): ITextFormat {
  const result = {}
  for (const { format } of stack) {
    for (const key in format) {
      result[key] = format[key]
    }
  }
  return result
}

function renderFormat (getColor: FGetColor, stack: StackEntry[], fullName: string): string {
  const props = []
  const style = reduceStack(stack)
  if (has(style.color)) props.push(`color: ${getColor(style.color)}`)
  if (has(style.fontFamily)) props.push(`fontFamily: Font.${style.fontFamily}`)
  if (has(style.fontSize)) props.push(`fontSize: ${toMaxDecimals(style.fontSize, 2)}`)
  if (has(style.textAlign)) props.push(`textAlign: '${adjustAlignment(style.textAlign)}'`)
  if (has(style.textTransform)) props.push(`textTransform: '${style.textTransform}'`)
  if (has(style.textAlignVertical)) props.push(`textAlignVertical: '${style.textAlignVertical}'`)
  if (props.length === 0) {
    return null
  }
  return `export const ${fullName}: TextStyle = Object.freeze({
  ${props.join(',\n  ')}
})
`
}

export interface TIDLookup { [id: string]: string }

interface StackEntry {
  name: string
  format: TextFormat
}

function _renderHierarchy (getColor: FGetColor, styles: Hierarchy<TextFormat>, stack: StackEntry[], entries: string[], textStyles: TIDLookup): void {
  for (const name in styles) {
    const node = styles[name]
    stack.push({ name, format: node.item })
    const fullName = fontStyleName(stack)
    if (node.item !== null && node.item !== undefined) {
      textStyles[node.item !== undefined ? node.item.id : ((Math.random() * 0xFFFFFFFFFFFF) | 0).toString(32)] = fullName
      const entry = renderFormat(getColor, stack, fullName)
      if (entry !== null) {
        entries.push(entry)
      }
    }
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
