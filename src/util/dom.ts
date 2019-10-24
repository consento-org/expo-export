import { Document, AnyLayer, Text, Artboard, SymbolMaster, Image, SymbolInstance, Group, AnyGroup, Page, AnyParent } from 'sketch/dom'
import { LRUCache } from './string'

interface IDocumentData {
  textStyleWithID(id: string): undefined | {
    style(): {
      primitiveTextStyle(): undefined | {
        attributes(): {
          'NSFont': {
            fontName(): string
          }
        }
      }
    }
  }
}

export function createFontNameLookup (document: Document, contextDocument: any): (id: string) => string | undefined {
  // Important: Font name lookup will not work for the styles unless we accessed the style property
  document.sharedTextStyles.forEach(shared => shared.style.fontFamily)

  const documentData = contextDocument.documentData() as IDocumentData
  return (id: string): string | undefined => {
    const textStyle = documentData.textStyleWithID(id)
    if (textStyle === undefined || textStyle === null) {
      throw new Error('Unidentified font')
    }
    const style = textStyle.style().primitiveTextStyle()
    if (style === undefined || style === null) {
      throw new Error('This shouldnt happen, but for some reason we havnt got a reference to a style anymore, please try again')
    }
    return style.attributes().NSFont.fontName()
  }
}

export function isGroup (item: AnyLayer): item is Group {
  if (isIgnored(item)) return false
  return item.type === 'Group' || item.type === 'Artboard'
}

export function isTextLayer (item: AnyLayer): item is Text {
  if (isIgnored(item)) return false
  return item.type === 'Text'
}

export function isArtboard (item: AnyLayer): item is Artboard {
  if (isIgnored(item)) return false
  return item.type === 'Artboard' || isSymbolMaster(item)
}

export function isImage (item: AnyLayer): item is Image {
  if (isIgnored(item)) return false
  return item.type === 'Image'
}

export function isSymbolInstance (item: AnyLayer): item is SymbolInstance {
  if (isIgnored(item)) return false
  return item.type === 'SymbolInstance'
}

export function isSymbolMaster (item: AnyLayer): item is SymbolMaster {
  if (isIgnored(item)) return false
  return item.type === 'SymbolMaster'
}

export type FTreeWalker = (item: AnyLayer, stackNames: string[]) => void | true | false

const _isIgnored = LRUCache<boolean, AnyLayer | Page> ((_: string, item: AnyLayer | Page) => {
  let parent: AnyParent = item.parent
  if (!(parent instanceof Document)) {
    if (isIgnored(parent as AnyLayer)) {
      return true
    }
  }
  return /^\s*#/.test(item.name)
}, 1000)

export function isIgnored (item: AnyLayer | Page): boolean {
  return _isIgnored(item.id, item)
}

export function iterate (item: AnyLayer, handler: FTreeWalker, stackNames: string[]): void {
  if (isIgnored(item)) {
    return
  }
  if (handler(item, stackNames) === true) {
    return
  }
  if (item instanceof Group) {
    stackNames.push(item.name)
    eachItem(item, handler, stackNames)
    stackNames.pop()
  }
}

function eachItem (container: AnyGroup, handler: FTreeWalker, stackNames: string[]): void {
  for (const item of container.layers) {
    iterate(item, handler, stackNames)
  }
}

export function iterateDocument (document: Document, handler: FTreeWalker): void {
  document.pages
    .filter(page => !isIgnored(page))
    .forEach(page => eachItem(page, handler, []))
}
