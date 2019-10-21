import { alert } from 'sketch/ui'
import { Document } from 'sketch/dom'
import { write } from './util/fs'
import { generateColors } from './generate/color'
import { generateFonts } from './generate/font'
import { generateTextStyles } from './generate/text'

function folder (path: string): (sub: string) => string {
  const reg = /^(.*)(\.sketch)$/ig
  const parts = reg.exec(path)
  const base = parts !== null ? `${parts[1]}@expo` : `${path}@expo`
  return (sub: string) => sub === '' ? base : `${base}/${sub}`
}

interface IDocumentData {
  textStyleWithID(id: string): undefined | {
    style(): {
      primitiveTextStyle(): undefined | {
        attributes(): {
          'NSFont': {
            fontName(): string
          }
        }
      }
    }
  }
}

function fontNameForSet (documentData: IDocumentData, id: string): string {
  const font = documentData.textStyleWithID(id)
  if (font === undefined || font === null) {
    throw new Error('Unidentified font')
  }
  const style = font.style().primitiveTextStyle()
  if (style === undefined) {
    throw new Error('This shouldnt happen, but for some reason we havnt got a reference to a style anymore, please try again')
  }
  return style.attributes().NSFont.fontName()
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
  const fontNameLookup = fontNameForSet.bind(null, context.document.documentData() as IDocumentData)
  write(target('src/styles/Color.ts'), generateColors(document))
  write(target('src/styles/Font.ts'), generateFonts(document, fontNameLookup))
  write(target('src/styles/TextStyle.ts'), generateTextStyles(document, fontNameLookup))
}
