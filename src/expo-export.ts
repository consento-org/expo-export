import { alert } from 'sketch/ui'
import { Document } from 'sketch/dom'
import { write } from './util/fs'
import { generateColors } from './generate/color'
import { generateFonts } from './generate/font'
import { generateTextStyles } from './generate/text'
import { writeAssets } from './generate/assets'
import { createFontNameLookup } from './util/dom'

function folder (path: string): (sub: string) => string {
  const reg = /^(.*)(\.sketch)$/ig
  const parts = reg.exec(path)
  const base = parts !== null ? `${parts[1]}@expo` : `${path}@expo`
  return (sub: string) => sub === '' ? base : `${base}/${sub}`
}


export default function (context: any): void {
  const document = Document.getSelectedDocument()
  if (document === undefined) {
    return alert('Document missing', 'Please open a document first!')
  }
  const url = document.path
  if (url === null) {
    return alert('URL missing', 'Please save the document first!')
  }
  const target = folder(url)
  const fontNameLookup = createFontNameLookup(document, context.document as any)
  write(target('src/styles/Color.ts'), generateColors(document))
  write(target('src/styles/Font.ts'), generateFonts(document, fontNameLookup))
  write(target('src/styles/TextStyle.ts'), generateTextStyles(document, fontNameLookup))

  writeAssets(document, target)
}
