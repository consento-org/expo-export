import { Document, SharedStyle, TextStyle } from 'sketch/dom'
import { Hierarchy } from '../../util/hierarchy'
import { TextFormat } from './TextFormat'
import { fontShortID } from '../font'

export type TFontName = (id: string) => string

function processShared (shared: SharedStyle<TextStyle>, fontName: TFontName): TextFormat {
  return new TextFormat({
    id: shared.id,
    fontFamily: fontShortID(fontName(shared.id)),
    fontSize: shared.style.fontSize,
    color: shared.style.textColor,
    lineHeight: shared.style.lineHeight,
    textTransform: shared.style.textTransform,
    textAlign: shared.style.alignment
  })
}

export function collectTextStyles (document: Document, fontName: TFontName): Hierarchy<TextFormat> {
  const styles: Hierarchy<TextFormat> = {}
  document.sharedTextStyles.forEach(shared => {
    const parts = shared.name.split('/').map(part => part.replace(/^\s+|\s+$/ig, ''))
    let parent: Hierarchy<TextFormat> = styles
    while (parts.length > 1) {
      // ↓ since length > 0 is never undefined the type "string | undefined" is not correct
      // eslint-disable-next-line
      const parentName = parts.shift()
      let parentParent = parent[parentName]
      if (parentParent === undefined) {
        parentParent = {
          children: {}
        }
        parent[parentName] = parentParent
      }
      parent = parentParent.children
    }
    // ↓ since string.split **always** creates an array with length > 0 is never undefined the type "string | undefined" is not correct
    // eslint-disable-next-line
    parent[parts.shift() as string] = {
      item: processShared(shared, fontName),
      children: {}
    }
  })

  return styles
}
