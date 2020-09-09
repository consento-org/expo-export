import { renderHierarchy, TIDLookup } from './text/renderHierarchy'
import { collectTextStyles } from './text/collectTextStyles'
import { Document } from 'sketch/dom'
import { Imports, ITypeScript } from '../util/render'

export function generateTextStyles (document: Document, fontName: (id: string) => string): {
  textStyles: TIDLookup
  textStyleData: ITypeScript
} {
  const styles = collectTextStyles(document, fontName)
  const imports: Imports = {}
  const textStyles = renderHierarchy(document, imports, styles)
  return {
    textStyles,
    textStyleData: {
      pth: 'src/styles/TextStyles.ts',
      imports,
      code: `import { TextStyle } from 'react-native'

${Object.values(textStyles).map(entry => entry.output).join('\n')}
export const TextStyles = {
  ${Object.values(textStyles).map(entry => entry.name).join(',\n  ')}
}`
    }
  }
}
