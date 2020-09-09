import { Document, AnyLayer, Text, Artboard, SymbolMaster, Image, SymbolInstance, Group, AnyGroup, Page, AnyParent, Shape, ShapePath, Slice, Override } from 'sketch/dom'
import { LRUCache } from './string'
import { getDesignNameByPath } from './fs'

interface IDocumentData {
  textStyleWithID: (id: string) => undefined | {
    style: () => {
      primitiveTextStyle: () => undefined | {
        attributes: () => {
          'NSFont': {
            fontName: () => string
          }
        }
      }
    }
  }
}

export function getDesignName (document: Document): string {
  return getDesignNameByPath(document.path)
}

export enum Type {
  document = 'Document',
  page = 'Page',
  instance = 'SymbolInstance',
  master = 'SymbolMaster',
  text = 'Text',
  image = 'Image',
  group = 'Group',
  artboard = 'Artboard',
  shape = 'Shape',
  shapePath = 'ShapePath',
  hotSpot = 'HotSpot',
  slice = 'Slice',
  exportFormat = 'ExportFormat',
  colorAsset = 'ColorAsset',
  gradientAsset = 'GradientAsset'
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
  return item.type === Type.group || item.type === Type.artboard
}

export enum ShapeType {
  Rectangle = 'Rectangle',
  Oval = 'Oval',
  Triangle = 'Triangle',
  Polygon = 'Polygon',
  Star = 'Star',
  Custom = 'Custom'
}

export enum FillType {
  Color = 'Color',
  Gradient = 'Gradient',
  Pattern = 'Pattern'
}

export function isShape (item: AnyLayer): item is Shape {
  if (isIgnored(item)) return false
  return item.type === Type.shape
}

export function isShapePath (item: AnyLayer): item is ShapePath {
  if (isIgnored(item)) return false
  return item.type === Type.shapePath
}

export function isTextLayer (item: AnyLayer): item is Text {
  if (isIgnored(item)) return false
  return item.type === Type.text
}

export function isArtboard (item: AnyLayer): item is Artboard {
  if (isIgnored(item)) return false
  return item.type === Type.artboard || isSymbolMaster(item)
}

export function isImage (item: AnyLayer): item is Image {
  if (isIgnored(item)) return false
  return item.type === Type.image
}

export function isSymbolInstance (item: AnyLayer): item is SymbolInstance {
  if (isIgnored(item)) return false
  return item.type === Type.instance
}

export function isSymbolMaster (item: AnyLayer): item is SymbolMaster {
  if (isIgnored(item)) return false
  return item.type === Type.master
}

export function isSlice (item: AnyLayer): item is Slice {
  if (isIgnored(item)) return false
  return item.type === Type.slice
}

export function getSlice9Layer (item: Artboard): Slice | undefined {
  for (const layer of item.layers) {
    if (isSlice9(layer)) return layer
  }
}

export function isSlice9 (item: AnyLayer): item is Slice {
  if (!isSlice(item)) return false
  if (item.name !== 'slice-9') return false
  return true
}

export function isTextOverride (item: Override): item is Override<Text, string> {
  return item.property === 'stringValue'
}

export function hasSlice9 (group: Artboard): boolean {
  return getSlice9Layer(group) !== undefined
}

export function isExported (artboard: Artboard): boolean {
  return artboard.exportFormats.length > 0
}

const _isIgnored = LRUCache<boolean, AnyLayer | Page>((_: string, item: AnyLayer | Page) => {
  const parent: AnyParent = item.parent
  if (!(parent instanceof Document)) {
    if (isIgnored(parent as AnyLayer)) {
      return true
    }
  }
  return /^\s*#/.test(item.name)
}, 1000)

export function isIgnored (item: AnyLayer | Page): boolean {
  return item === undefined || item === null || _isIgnored(item.id, item)
}

export function * recursiveLayers (container: AnyGroup, filter: (layer: AnyLayer) => boolean): Generator<AnyLayer> {
  for (const layer of container.layers) {
    if (!filter(layer)) continue
    yield layer
    if (isGroup(layer)) {
      for (const child of recursiveLayers(layer, filter)) {
        yield child
      }
    }
  }
}
