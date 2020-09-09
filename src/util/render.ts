import { disclaimer } from '../generate/disclaimer'
import { dirname, write, readPluginAsset } from './fs'

export interface Imports { [from: string]: string[] }

export function addImport (target: Imports, from: string, symbol: string | string[]): Imports {
  let byFrom = target[from]
  if (byFrom === undefined) {
    byFrom = []
    target[from] = byFrom
  }
  // Note: it is important here to create the array even though the input
  //       shall be an array, to indicate an intrinsic dependency
  if (Array.isArray(symbol)) {
    for (const child of symbol) {
      addImport(target, from, child)
    }
    return target
  }
  if (!byFrom.includes(symbol)) {
    byFrom.push(symbol)
  }
  return target
}

export function renderImports (imports: Imports, location: string): string {
  const statements = []
  for (const from in imports) {
    let fromParts: string[]
    if (/^.\//.test(from)) {
      fromParts = from.split('/')
      if (fromParts[0] === '.') {
        fromParts.shift()
      }
      const locationParts = location.replace(/^\.\//, '').split('/')
      while (fromParts.length > 1 && locationParts.length > 0 && fromParts[0] === locationParts[0]) {
        fromParts.shift()
        locationParts.shift()
      }
      if (locationParts.length === 0) {
        fromParts.unshift('.')
      } else {
        for (let i = 0; i < locationParts.length; i++) {
          fromParts.unshift('..')
        }
      }
    } else {
      fromParts = [from]
    }
    const symbols = imports[from]
    // Symbols might be empty in when rendering typescript file from the plugin
    // that uses "imports" as an indicator that a file is imported inline of the code
    // such as `/assets/styles/Component.tsx` (it already contains imports) but
    // lets the system know that it references other files.
    if (symbols.length > 0) {
      statements.push(`import { ${symbols.join(', ')} } from '${fromParts.join('/')}'`)
    }
  }
  return statements.join('\n')
}

export interface IDataOutput {
  pth: string
  data: string | Buffer
}

export interface ITypeScript {
  pth: string
  imports: Imports
  code: string
}

export type IOutput = IDataOutput | ITypeScript

export function isTypeScript (output: IOutput | null | undefined): output is ITypeScript {
  if (output === null || output === undefined) return false
  return 'imports' in output && 'code' in output
}

export function isDataOutput (output: IOutput | null | undefined): output is IDataOutput {
  if (output === null || output === undefined) return false
  if (isTypeScript(output)) return false
  return 'data' in output
}

export function writeOutput (output: IOutput, target: (str: string) => string): boolean {
  if (isTypeScript(output)) {
    return writeTypeScript(output.pth, output.imports, output.code, target)
  }
  if (isDataOutput(output)) {
    return write(target(output.pth), output.data)
  }
  return false
}

export function writeTypeScript (pth: string, imports: Imports, code: string, target: (str: string) => string): boolean {
  let importsString = renderImports(imports, dirname(pth))
  if (importsString !== '') {
    importsString += '\n'
  }
  return write(target(pth), `${disclaimer}
${importsString}${code.trim()}
`)
}

export function readPluginTypeScript (pth: string, imports: Imports = {}): ITypeScript {
  return {
    pth: `./src/${pth}`,
    imports,
    code: readPluginAsset(pth, 'utf-8')
  }
}
