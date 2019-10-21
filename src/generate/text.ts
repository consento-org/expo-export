import { renderHierarchy } from './text/renderHierarchy'
import { collectTextStyles } from './text/collectTextStyles'
import { Document } from 'sketch/dom'

export function generateTextStyles (document: Document, fontName: (id: string) => string): string {
  const styles = collectTextStyles(document, fontName)
  const { entries, textStyles } = renderHierarchy(document, styles)
  return `import { Color } from './Color'
import { Font } from './Font'

${entries.join('\n')}
export const TextStyle = {
  ${Object.values(textStyles).join(',\n  ')}
}
`
}
