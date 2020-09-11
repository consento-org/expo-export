import { Document, SharedStyle, Text, TextStyle } from 'sketch/dom'
import { Hierarchy } from '../../util/hierarchy'
import { exists } from '../../../assets/styles/util/lang'
import { stringSort, childName } from '../../util/string'
import { fontShortID } from '../font'
import { TextStyle as NativeTextStyle } from 'react-native'

export type IGetFontName = (id: string) => string

function adjustAlignment (alignment: 'center' | 'right' | 'left' | 'justified'): 'left' | 'right' | 'center' | 'justify' {
  if (alignment === 'justified') {
    return 'justify'
  }
  return alignment
}

export const PROCESSED = Symbol('processed')

export type ITextStyle = Required<Pick<NativeTextStyle, 'fontFamily' | 'fontSize' | 'color' | 'lineHeight' | 'textTransform' | 'textAlign' | 'textAlignVertical'>> & { [PROCESSED]: true }

export const DEFAULT_FONTFAMILY = ''
const DEFAULT_FONTSIZE = 12
const DEFAULT_TEXT_COLOR = '#000000000'
const DEFAULT_TEXT_ALIGN = 'left'
const DEFAULT_TEXT_TRANSFORM = 'none'
const DEFAULT_VERTICAL_TEXT_ALIGN = 'center'

function numberDefault (input: number | null | undefined, fallback: () => number): number {
  if (typeof input !== 'number' || isNaN(input)) {
    return fallback()
  }
  return input
}

export function processStyle (style: TextStyle, fontFamily?: string, defaultLineHeight?: () => number): ITextStyle {
  return {
    [PROCESSED]: true,
    fontFamily: fontFamily ?? DEFAULT_FONTFAMILY,
    fontSize: style.fontSize ?? DEFAULT_FONTSIZE,
    color: style.textColor ?? DEFAULT_TEXT_COLOR,
    lineHeight: numberDefault(style.lineHeight, (defaultLineHeight ?? (() => style.getDefaultLineHeight()))),
    textTransform: style.textTransform ?? DEFAULT_TEXT_TRANSFORM,
    textAlign: adjustAlignment(style.alignment ?? DEFAULT_TEXT_ALIGN),
    textAlignVertical: style.verticalAlignment ?? DEFAULT_VERTICAL_TEXT_ALIGN
  }
}

export function processSharedStyle (shared: SharedStyle<TextStyle>, fontName: IGetFontName): ITextStyle {
  // Fix: Sketch stores the wrong fontFontFamily in shared text styles \_(-_-)_/
  const overrideFont = fontShortID(fontName(shared.id))
  // Fix: Sketch doesn't provide a correct lineHeight for shared styles \_(-_-)_/
  const defaultLineHeight = (): number => {
    const tmpText = new Text()
    tmpText.text = 'hello'
    tmpText.sharedStyleId = shared.id
    tmpText.style.syncWithSharedStyle(shared)
    return tmpText.style.getDefaultLineHeight()
  }
  return processStyle(shared.style, overrideFont, defaultLineHeight)
}

export interface ITextStyleEntry {
  name: string
  id: string
  style: ITextStyle
  parent?: ITextStyleEntry
}

function reduceHierarchyDepthFirst (hierarchy: Hierarchy<SharedStyle<TextStyle>>, fontName: IGetFontName, list?: ITextStyleEntry[], parent?: ITextStyleEntry): ITextStyleEntry[] {
  list = list ?? []
  for (const name of Object.keys(hierarchy).sort(stringSort)) {
    const node = hierarchy[name]
    let nodeParent = parent
    if (node.item) {
      nodeParent = {
        name: childName(node.item.name),
        id: node.item.id,
        style: processSharedStyle(node.item, fontName),
        parent
      }
      list.push(nodeParent)
    }
    reduceHierarchyDepthFirst(node.children, fontName, list, nodeParent)
  }
  return list
}

export function collectStyleHierarchy (document: Document, fontName: IGetFontName): ITextStyleEntry[] {
  const styles: Hierarchy<SharedStyle<TextStyle>> = {}
  for (const shared of document.sharedTextStyles) {
    const parts = shared.name.split('/').map(part => part.trim())
    const fullName = parts.join('/')
    let parent = styles
    let name = parts.shift()
    while (parts.length > 0) {
      const parentName = name
      name = parts.shift()
      let parentParent = parent[parentName]
      if (parentParent === undefined) {
        parentParent = { children: {} }
        parent[parentName] = parentParent
      }
      parent = parentParent.children
    }
    if (!exists(parent[name])) {
      parent[name] = {
        item: shared,
        children: {}
      }
      continue
    }
    if (exists(parent[name]?.item)) {
      console.warn(`TextStyles.${fullName} has more than one style with conflicting name "${shared.name}" and "${parent[name].item.name}"`)
      continue
    }
    parent[name].item = shared
  }
  return reduceHierarchyDepthFirst(styles, fontName)
}
