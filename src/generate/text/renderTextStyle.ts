import { toMaxDecimals } from '../../util/number'
import { FGetColor } from '../color'
import { Imports, addImport } from '../../util/render'
import { ITextStyle, ITextStyleEntry, DEFAULT_FONTFAMILY } from './collectStyleHierarchy'

function compare <TShallow extends Object> (reference: TShallow, item: TShallow): { isEntirelyDifferent: boolean, props: Set<string> } {
  const refKeys = new Set(Object.keys(reference))
  const itemKeys = new Set(Object.keys(item))
  const props = new Set<string>()
  for (const key of refKeys) {
    if (!itemKeys.has(key)) {
      continue
    }
    const refVal = reference[key]
    const itemVal = item[key]
    // eslint-disable-next-line eqeqeq
    if (refVal != itemVal) {
      props.add(key)
    }
  }
  for (const key of itemKeys) {
    if (!refKeys.has(key)) {
      props.add(key)
    }
  }
  const isEntirelyDifferent = props.size === itemKeys.size
  return {
    isEntirelyDifferent,
    props
  }
}

function renderProps (designName: string, imports: Imports, style: ITextStyle, getColor: FGetColor, diff?: Set<string>): string {
  const fields = []
  const field = (prop: string, render: () => string | undefined): void => {
    if (diff !== undefined && !diff.has(prop)) {
      return
    }
    const rendered = render()
    if (rendered === undefined) {
      return
    }
    fields.push(`
  ${prop}: ${rendered}`)
  }

  field('color', () => getColor(style.color, imports))
  field('fontFamily', () => {
    if (style.fontFamily === DEFAULT_FONTFAMILY) {
      return
    }
    addImport(imports, `./src/styles/${designName}/Font`, 'Font')
    return `Font.${style.fontFamily}`
  })
  field('fontSize', () => toMaxDecimals(style.fontSize, 2).toString())
  field('lineHeight', () => toMaxDecimals(style.fontSize, 2).toString())
  field('textAlign', () => `'${style.textAlign}'`)
  field('textTransform', () => `'${style.textTransform}'`)
  field('textAlignVertical', () => `'${style.textAlignVertical}'`)
  return fields.join(',')
}

export function renderTextStyle (designName: string, imports: Imports, getColor: FGetColor, style: ITextStyle, parent?: ITextStyleEntry, isDeclaration: boolean = false): string {
  let prefix = ''
  if (!isDeclaration) {
    prefix = 'TextStyles.'
  }
  if (parent) {
    const diff = compare(parent.style, style)
    if (diff.props.has('fontFamily') && style.fontFamily === '') {
      diff.props.delete('fontFamily')
    }
    if (diff.props.size === 0) {
      if (!isDeclaration) {
        addImport(imports, `./src/styles/${designName}/TextStyles`, 'TextStyles')
      }
      return `${prefix}${parent.name}`
    }
    if (!diff.isEntirelyDifferent) {
      if (!isDeclaration) {
        addImport(imports, `./src/styles/${designName}/TextStyles`, 'TextStyles')
      }
      return `{
  ...${prefix}${parent.name},${renderProps(designName, imports, style, getColor, diff.props)}
}`
    }
  }
  return `{${renderProps(designName, imports, style, getColor)
}
}`
}
