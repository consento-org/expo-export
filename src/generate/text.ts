import { renderHierarchy, TIDLookup } from './text/renderHierarchy'
import { collectTextStyles } from './text/collectTextStyles'
import { Document } from 'sketch/dom'
import { disclaimer } from './disclaimer'

export function generateTextStyles (document: Document, fontName: (id: string) => string): {
  textStyles: TIDLookup
  textStyleData: string
} {
  const styles = collectTextStyles(document, fontName)
  const { entries, textStyles } = renderHierarchy(document, styles)
  return {
    textStyles,
    textStyleData: `${disclaimer}
import { Color } from './Color'
import { Font } from './Font'
import { TextStyle } from 'react-native'

${entries.join('\n')}
export const TextStyles = {
  ${Object.values(textStyles).join(',\n  ')}
}
`
  }
}
