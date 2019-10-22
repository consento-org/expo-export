import { alert } from 'sketch/ui'
import { Document } from 'sketch/dom'
import { write } from './util/fs'
import { generateColors } from './generate/color'
import { generateFonts } from './generate/font'
import { generateTextStyles } from './generate/text'
import { writeAssets } from './generate/assets'
import { writeComponents } from './generate/components'
import { createFontNameLookup } from './util/dom'

function folder (path: string): (sub: string) => string {
  path = decodeURI(path)
  const reg = /^(.*)(\.sketch)$/ig
  const parts = reg.exec(path)
  const base = parts !== null ? `${parts[1]}@expo` : `${path}@expo`
  return (sub: string) => sub === '' ? base : `${base}/${sub}`
}

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
  const target = folder(url)
  const fontNameLookup = createFontNameLookup(document, context.document)
  if (opts.color === true) write(target('src/styles/Color.ts'), generateColors(document))
  if (opts.font === true) write(target('src/styles/Font.ts'), generateFonts(document, fontNameLookup))
  const { textStyles, textStyleData } = generateTextStyles(document, fontNameLookup)
  if (opts.textStyle === true) write(target('src/styles/TextStyle.ts'), textStyleData)

  if (opts.assets === true) writeAssets(document, target)
  if (opts.components === true) writeComponents(document, target, textStyles)
}
