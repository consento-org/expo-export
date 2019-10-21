import { renderHierarchy, TIDLookup } from './text/renderHierarchy'
import { collectTextStyles } from './text/collectTextStyles'
import { Document } from 'sketch/dom'

export function generateTextStyles (document: Document, fontName: (id: string) => string): {
  textStyles: TIDLookup
  textStyleData: string
} {
  const styles = collectTextStyles(document, fontName)
  const { entries, textStyles } = renderHierarchy(document, styles)
  return {
    textStyles,
    textStyleData: `import { Color } from './Color'
import { Font } from './Font'

export enum ETextAlign {
  left = 'left',
  right = 'right',
  center = 'center',
  justified = 'justified'
}
export enum ETextTransform {
  uppercase = 'uppercase',
  lowercase = 'lowercase',
  none = 'none'
}

export interface ITextStyle {
  color: string
  fontFamily: Font
  fontSize: number
  textAlign: ETextAlign
  textTransform: ETextTransform
}

${entries.join('\n')}
export const TextStyle = {
  ${Object.values(textStyles).join(',\n  ')}
}
`
  }
}
