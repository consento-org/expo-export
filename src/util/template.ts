export type TTemplateProcessor = (found: string) => string
interface TTemplates { [key: string]: TTemplateProcessor }

export function replace (source: string, props: { [key: string]: number | string }): string {
  for (const name in props) {
    const value = props[name]
    if (typeof value === 'string') {
      source = source.replace(new RegExp(`\\$${name}`, 'igm'), value)
    } else {
      source = source.replace(new RegExp(`Number\\s*\\(\\s*\\$${name}\\s*\\)`, 'igm'), value.toString())
    }
  }
  return source
}

interface TRegResult extends Array<string> {
  index: number
}

export function template (source: string, { blocks, lines }: { blocks?: TTemplates, lines?: TTemplates }): string {
  for (var blockName in blocks) {
    const processor = blocks[blockName]
    const start = new RegExp(`(^|\n)\\s*// \\^${blockName}\n`, 'igm')
    const end = new RegExp(`\n\\s*// \\$${blockName}(\n|$)`, 'igm')
    let found: TRegResult
    while ((found = start.exec(source)) !== null) {
      const blockStart = found.index
      const dataStart = found.index + found[0].length
      end.lastIndex = dataStart
      found = end.exec(source)
      if (found === null) {
        break
      }
      const result = processor(source.substring(dataStart, found.index + 1))
      start.lastIndex = blockStart + result.length
      source = `${source.substring(0, blockStart + 1)}${result}${source.substr(found.index + (found[0]).length)}`
    }
  }
  if (lines === undefined) {
    return source
  }
  return source.replace(new RegExp('(^|\\n)(.+) // !!!([a-z0-9]+)\\n', 'igm'), (original: string, start: string, found: string, lineName: string) => {
    const processor = lines[lineName]
    if (processor === undefined) {
      return original
    }
    return start + processor(found + '\n')
  })
}
