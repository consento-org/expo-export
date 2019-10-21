export interface Imports { [from: string]: string[] }

export function addImport (target: Imports, from: string, symbol: string): Imports {
  let byFrom = target[from]
  if (byFrom === undefined) {
    byFrom = []
    target[from] = byFrom
  }
  if (byFrom.indexOf(symbol) === -1) {
    byFrom.push(symbol)
  }
  return target
}

export function renderImports (imports: Imports, location: string): string {
  const statements = []
  for (const from in imports) {
    const fromParts = from.split('/')
    const locationParts = location.split('/')
    while (fromParts.length > 1 && locationParts.length > 0) {
      if (fromParts[0] === locationParts[0]) {
        fromParts.shift()
        locationParts.shift()
      }
    }
    if (locationParts.length === 0) {
      fromParts.unshift('.')
    } else {
      for (let i = 0; i < locationParts.length; i++) {
        fromParts.unshift('..')
      }
    }
    statements.push(`import { ${imports[from].join(', ')} } from '${fromParts.join('/')}'`)
  }
  return statements.join('\n')
}
