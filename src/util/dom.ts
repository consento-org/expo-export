import { Document, Layer, ILayerContainer } from 'sketch/dom'

export function isLayerContainer (item: any): item is ILayerContainer {
  return item['layers'] !== undefined
}

export type FTreeWalker = (item: Layer) => void

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
