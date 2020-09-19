import { collectStyleHierarchy, ITextStyleEntry, IGetFontName } from './text/collectStyleHierarchy'
import { Document } from 'sketch/dom'
import { Imports, ITypeScript } from '../util/render'
import { getDesignName } from '../util/dom'
import { childName } from '../util/string'
import { getColorFactory } from './color'
import { renderTextStyle } from './text/renderTextStyle'

export interface TIDLookup { [id: string]: ITextStyleEntry }

export function generateTextStyles (document: Document, fontName: IGetFontName): {
  textStyles: TIDLookup
  textStyleData?: ITypeScript
} {
  const styles = collectStyleHierarchy(document, fontName)
  const imports: Imports = {}
  const textStyles: TIDLookup = {}
  for (const style of styles) {
    textStyles[style.id] = style
  }
  const textStyleList = Object.values(textStyles)
  const designName = getDesignName(document)
  const getColor = getColorFactory(document)
  if (textStyleList.length === 0) {
    return { textStyles }
  }
  return {
    textStyles,
    textStyleData: {
      pth: `./src/styles/${designName}/TextStyles.ts`,
      imports,
      code: `import { TextStyle } from 'react-native'
${styles.map(node => `
export const ${node.name}: TextStyle = ${renderTextStyle(designName, imports, getColor, node.style, node.parent, true)}`).join('\n')}
export const TextStyles = {${styles.map(node => `
  ${childName(node.name)}`).join(',')}
}`
    }
  }
}
