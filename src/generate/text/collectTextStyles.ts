import { Document, SharedStyle, TextStyle, Text } from 'sketch/dom'
import { Hierarchy } from '../../util/hierarchy'
import { TextFormat, ITextFormat } from './TextFormat'
import { fontShortID } from '../font'

export type TGetFontName = (id: string) => string

export function processStyle (style: TextStyle, lineHeight?: number): ITextFormat {
  return {
    fontSize: style.fontSize,
    color: style.textColor,
    lineHeight: style.lineHeight ?? style.getDefaultLineHeight() ?? lineHeight,
    textTransform: style.textTransform,
    textAlign: style.alignment,
    textAlignVertical: style.verticalAlignment
  }
}

function processShared (shared: SharedStyle<TextStyle>, fontName: TGetFontName): TextFormat {
  const tmpText = new Text()
  tmpText.text = 'hello'
  tmpText.sharedStyleId = shared.id
  tmpText.style.syncWithSharedStyle(shared)
  return new TextFormat({
    id: shared.id,
    fontFamily: fontShortID(fontName(shared.id)),
    ...processStyle(shared.style, tmpText.style.getDefaultLineHeight())
  })
}

export function collectTextStyles (document: Document, fontName: TGetFontName): Hierarchy<TextFormat> {
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
