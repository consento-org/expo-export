import { alert } from 'sketch/ui'
import { Document } from 'sketch/dom'
import { write, targetFolder } from './util/fs'
import { generateColors } from './generate/color'
import { generateFonts } from './generate/font'
import { generateTextStyles } from './generate/text'
import { writeAssets } from './generate/assets'
import { writeComponents } from './generate/components'
import { createFontNameLookup } from './util/dom'

export interface IExpoExportOpts {
  color: boolean
  font: boolean
  textStyle: boolean
  assets: boolean
  components: boolean
}

export function expoExport (opts: IExpoExportOpts, context: any): void {
  const document = Document.getSelectedDocument()
  if (document === undefined) {
    return alert('Document missing', 'Please open a document first!')
  }
  const url = document.path
  if (url === null) {
    return alert('URL missing', 'Please save the document first!')
  }
  const target = targetFolder(url)
  const fontNameLookup = createFontNameLookup(document, context.document)
  if (opts.color === true) write(target('src/styles/Color.ts'), generateColors(document))
  if (opts.font === true) write(target('src/styles/Font.ts'), generateFonts(document, fontNameLookup))
  const { textStyles, textStyleData } = generateTextStyles(document, fontNameLookup)
  if (opts.textStyle === true) write(target('src/styles/TextStyles.ts'), textStyleData)

  if (opts.assets === true) writeAssets(document, target)
  if (opts.components === true) writeComponents(document, target, textStyles)
}
