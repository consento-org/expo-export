import { renderHierarchy, TIDLookup } from './text/renderHierarchy'
import { collectTextStyles } from './text/collectTextStyles'
import { Document } from 'sketch/dom'
import { disclaimer } from './disclaimer'
import { Imports, renderImports } from '../util/render'

export function generateTextStyles (document: Document, fontName: (id: string) => string): {
  textStyles: TIDLookup
  textStyleData: string
} {
  const styles = collectTextStyles(document, fontName)
  const imports: Imports = {}
  const textStyles = renderHierarchy(document, imports, styles)
  return {
    textStyles,
    textStyleData: `${disclaimer}
${renderImports(imports, 'src/styles')}
import { TextStyle } from 'react-native'

${Object.values(textStyles).map(entry => entry.output).join('\n')}
export const TextStyles = {
  ${Object.values(textStyles).map(entry => entry.name).join(',\n  ')}
}
`
  }
}
