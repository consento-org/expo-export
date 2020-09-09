import { renderHierarchy, TIDLookup } from './text/renderHierarchy'
import { collectTextStyles } from './text/collectTextStyles'
import { Document } from 'sketch/dom'
import { Imports, ITypeScript } from '../util/render'
import { getDesignName } from '../util/dom'

export function generateTextStyles (document: Document, fontName: (id: string) => string): {
  textStyles: TIDLookup
  textStyleData: ITypeScript
} {
  const styles = collectTextStyles(document, fontName)
  const imports: Imports = {}
  const textStyles = renderHierarchy(document, imports, styles)
  const designName = getDesignName(document)
  return {
    textStyles,
    textStyleData: {
      pth: `./src/styles/${designName}/TextStyles.ts`,
      imports,
      code: `import { TextStyle } from 'react-native'

${Object.values(textStyles).map(entry => entry.output).join('\n')}
export const TextStyles = {
  ${Object.values(textStyles).map(entry => entry.name).join(',\n  ')}
}`
    }
  }
}
