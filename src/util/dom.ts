import { Document, Layer, ILayerContainer, Text, Artboard, SymbolMaster, Image, SymbolInstance } from 'sketch/dom'

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

export function isLayerContainer (item: any): item is ILayerContainer {
  if (isIgnoredLayer(item)) return false
  return item.layers !== undefined
}

export function isTextLayer (item: Layer): item is Text {
  if (isIgnoredLayer(item)) return false
  return item.type === 'Text'
}

export function isArtboard (item: Layer): item is Artboard {
  if (isIgnoredLayer(item)) return false
  return item.type === 'Artboard' || isSymbolMaster(item)
}

export function isImage (item: Layer): item is Image {
  if (isIgnoredLayer(item)) return false
  return item.type === 'Image'
}

export function isSymbolInstance (item: Layer): item is SymbolInstance {
  if (isIgnoredLayer(item)) return false
  return item.type === 'SymbolInstance'
}

export function isSymbolMaster (item: Layer): item is SymbolMaster {
  if (isIgnoredLayer(item)) return false
  return item.type === 'SymbolMaster'
}

export type FTreeWalker = (item: Layer, stackNames: string[]) => void | true | false

export function isIgnoredLayer (item: Layer): boolean {
  return /^\s*#/.test(item.name)
}

export function iterate (item: Layer, handler: FTreeWalker, stackNames: string[]): void {
  if (isIgnoredLayer(item)) {
    return
  }
  if (handler(item, stackNames) === true) {
    return
  }
  if (isLayerContainer(item)) {
    stackNames.push(item.name)
    eachItem(item, handler, stackNames)
    stackNames.pop()
  }
}

function eachItem (container: ILayerContainer, handler: FTreeWalker, stackNames: string[]): void {
  for (const item of container.layers) {
    iterate(item, handler, stackNames)
  }
}

export function iterateDocument (document: Document, handler: FTreeWalker): void {
  document.pages.forEach(page => eachItem(page, handler, []))
}
