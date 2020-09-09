import { alert } from 'sketch/ui'
import { Document } from 'sketch/dom'
import { targetFolder, getConfig } from './util/fs'
import { generateColors } from './generate/color'
import { generateFonts } from './generate/font'
import { generateTextStyles } from './generate/text'
import { generateAssets } from './generate/assets'
import { generateComponents } from './generate/components'
import { createFontNameLookup } from './util/dom'
import { IOutput, writeOutput, isTypeScript, addImport, Imports, readPluginTypeScript, ITypeScript } from './util/render'

export interface IExpoExportOpts {
  color: boolean
  font: boolean
  textStyle: boolean
  assets: boolean
  components: boolean
}

function * _generateOutput (document: Document, opts: IExpoExportOpts, url: string, context: any): Generator<IOutput> {
  const config = getConfig(url)
  const fontNameLookup = createFontNameLookup(document, context.document)
  if (opts.color) {
    console.log('→ Generating colors')
    yield generateColors(document)
  }
  if (opts.font) {
    console.log('→ Generating fonts')
    yield generateFonts(document, fontNameLookup)
  }
  if (opts.textStyle || opts.assets || opts.components) {
    console.log('→ Collecting TextStyles')
    const { textStyles, textStyleData } = generateTextStyles(document, fontNameLookup)
    if (opts.textStyle) {
      console.log('→ Generating TextStyles')
      yield textStyleData
    }
    if (opts.assets) {
      console.log('→ Generating Assets')
      for (const output of generateAssets(document)) {
        yield output
      }
    }
    if (opts.components) {
      console.log('→ Generating Components')
      for (const output of generateComponents(document, textStyles, config)) {
        yield output
      }
    }
  }
}

const knownTSDeps: { [importKey: string]: { pth: string, imports: Imports } } = {
  './src/styles/util/lang': { pth: 'styles/util/lang.ts', imports: {} },
  './src/styles/util/useVUnits': { pth: 'styles/util/useVUnits.ts', imports: { './src/styles/util/createGlobalEffect': [] } },
  './src/styles/util/createGlobalEffect': { pth: 'styles/util/createGlobalEffect.ts', imports: {} },
  './src/Asset': { pth: 'Asset.tsx', imports: { './src/styles/util/lang': [] } }
}
const runtimeImports = new Set(['react-native'])

export function * generateOutput (document: Document, opts: IExpoExportOpts, url: string, context: any): Generator<IOutput> {
  const imports: Imports = {}
  const written = new Set()
  const processTs = (output: ITypeScript): void => {
    for (const from in output.imports) {
      addImport(imports, from, output.pth)
    }
    written.add(output.pth.replace(/\.tsx?$/, ''))
  }
  for (const output of _generateOutput(document, opts, url, context)) {
    if (isTypeScript(output)) {
      processTs(output)
    }
    yield output
  }

  console.log('→ Adding dependencies')
  do {
    const missingImport = Object.keys(imports).filter(imported => !written.has(imported))[0]
    if (!missingImport) {
      break
    }
    // Preventing infinite loop
    written.add(missingImport)
    const missingFile = knownTSDeps[missingImport]
    if (!missingFile) {
      if (!runtimeImports.has(missingImport)) {
        console.log(`Warning: ${missingImport} was referenced by ${imports[missingImport].join(', ')} but not generated this time!`)
      }
      continue
    }
    const ts = readPluginTypeScript(missingFile.pth, missingFile.imports)
    processTs(ts)
    yield ts
  } while (true)
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
  for (const output of generateOutput(document, opts, url, context)) {
    writeOutput(output, target)
  }
}
