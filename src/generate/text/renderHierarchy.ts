import { Hierarchy } from '../../util/hierarchy'
import { TextFormat, ITextFormat, TAlignment } from './TextFormat'
import { Document } from 'sketch/dom'
import { toMaxDecimals } from '../../util/number'
import { FGetColor, getColorFactory } from '../color'
import { safeChildName } from '../../util/string'
import { Imports, addImport } from '../../util/render'
import { getDesignName } from '../../util/dom'

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

export const formatFontProps = ['color', 'fontFamily', 'lineHeight', 'fontSize', 'textAlign', 'textTransform', 'textAlignVertical']
function reduceStack (stack: StackEntry[]): ITextFormat {
  const result = {}
  for (const { format } of stack) {
    if (typeof format === 'object') {
      formatFontProps.forEach(prop => {
        result[prop] = format[prop]
      })
    }
  }
  return result
}

export function getTextFormatRenderProps (designName: string, style: ITextFormat, getColor: FGetColor, imports: Imports): string[] {
  const props = []
  if (has(style.color)) props.push(`color: ${getColor(style.color, imports)}`)
  if (has(style.fontFamily)) {
    addImport(imports, `./src/styles/${designName}/Font`, 'Font')
    props.push(`fontFamily: Font.${style.fontFamily}`)
  }
  if (has(style.fontSize)) props.push(`fontSize: ${toMaxDecimals(style.fontSize, 2)}`)
  if (has(style.lineHeight)) props.push(`lineHeight: ${toMaxDecimals(style.lineHeight, 2)}`)
  if (has(style.textAlign)) props.push(`textAlign: '${adjustAlignment(style.textAlign)}'`)
  if (has(style.textTransform)) props.push(`textTransform: '${style.textTransform}'`)
  if (has(style.textAlignVertical)) props.push(`textAlignVertical: '${style.textAlignVertical}'`)
  return props
}

function renderFormat (designName: string, getColor: FGetColor, imports: Imports, stack: StackEntry[], fullName: string): TIDData {
  const style = reduceStack(stack)
  const props = getTextFormatRenderProps(designName, style, getColor, imports)
  if (props.length === 0) {
    return null
  }
  return {
    name: fullName,
    style,
    output: `export const ${fullName}: TextStyle = Object.freeze({
  ${props.join(',\n  ')}
})
`
  }
}

export interface TIDLookup { [id: string]: TIDData }

export interface TIDData {
  name: string
  style: ITextFormat
  output: string
}

interface StackEntry {
  name: string
  format: TextFormat
}

function _renderHierarchy (designName: string, getColor: FGetColor, imports: Imports, styles: Hierarchy<TextFormat>, stack: StackEntry[], textStyles: TIDLookup): void {
  for (const name in styles) {
    const node = styles[name]
    stack.push({ name, format: node.item })
    const fullName = fontStyleName(stack)
    if (node.item !== null && node.item !== undefined) {
      const entry = renderFormat(designName, getColor, imports, stack, fullName)
      if (entry !== null) {
        textStyles[node.item !== undefined ? node.item.id : ((Math.random() * 0xFFFFFFFFFFFF) | 0).toString(32)] = entry
      }
    }
    _renderHierarchy(designName, getColor, imports, node.children, stack, textStyles)
    stack.pop()
  }
}

export function renderHierarchy (document: Document, imports: Imports, styles: Hierarchy<TextFormat>): TIDLookup {
  const getColor = getColorFactory(document)
  const designName = getDesignName(document)
  const textStyles: TIDLookup = {}
  _renderHierarchy(designName, getColor, imports, styles, [], textStyles)
  return textStyles
}
