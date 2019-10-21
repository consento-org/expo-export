import { Document, Layer, ILayerContainer, Text, Artboard } from 'sketch/dom'

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

export function createFontNameLookup (document: Document, contextDocument: any) {
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
  return item['layers'] !== undefined
}

export type FTreeWalker = (item: Layer) => void
export function isTextLayer (item: Layer): item is Text {
  return item.type === 'Text'
}

export function isArtboard (item: Layer): item is Artboard {
  return item.type === 'Artboard'
}

function iterate (item: Layer, handler: FTreeWalker): void {
  if (isLayerContainer(item)) {
    eachItem(item, handler)
  }
  handler(item)
}

function eachItem (container: ILayerContainer, handler: FTreeWalker): void {
  for (const item of container.layers) {
    iterate(item, handler)
  }
}

export function iterateDocument (document: Document, handler: FTreeWalker): void {
  document.pages.forEach(page => eachItem(page, handler))
}
