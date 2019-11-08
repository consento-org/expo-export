import { Document, Artboard, Text, AnyLayer, ShapePath, Fill, Border, BorderOptions } from 'sketch/dom'
import { iterateDocument, isTextLayer, isArtboard, isSymbolInstance, isIgnored, isShapePath, ShapeType, FillType } from '../util/dom'
import { write } from '../util/fs'
import { getColorFactory, FGetColor } from './color'
import { Imports, addImport, renderImports } from '../util/render'
import { toMaxDecimals } from '../util/number'
import { childName } from '../util/string'
import { disclaimer } from './disclaimer'

abstract class Component {
  layer: AnyLayer
  type: string

  constructor (layer: AnyLayer, type: string) {
    this.layer = layer
    this.type = type
  }

  abstract format (name: string, imports: Imports, getColor: FGetColor): string

  renderFrame (): string {
    return `{ x: ${toMaxDecimals(this.layer.frame.x, 2)}, y: ${toMaxDecimals(this.layer.frame.y, 2)}, w: ${toMaxDecimals(this.layer.frame.width, 2)}, h: ${toMaxDecimals(this.layer.frame.height, 2)} }`
  }
}

class Image extends Component {
  asset: string

  constructor (layer: AnyLayer, asset?: string) {
    super(layer, 'image')
    this.asset = asset
  }

  format (name: string, imports: Imports, _: FGetColor): string {
    addImport(imports, 'src/Asset', 'Asset')
    addImport(imports, 'src/styles/Component', 'AssetPlacement')
    return `  ${name} = new AssetPlacement(Asset.${this.asset === undefined ? name : this.asset}, ${this.renderFrame()})`
  }
}

class TextComponent extends Component {
  text: string
  textStyle: string
  constructor (layer: Text, textStyle: string) {
    super(layer, 'text')
    this.text = layer.text
    this.textStyle = textStyle
  }

  format (name: string, imports: Imports, _: FGetColor): string {
    addImport(imports, 'src/styles/Component', 'Text')
    addImport(imports, 'src/styles/TextStyle', 'TextStyle')
    return `  ${name} = new Text('${this.text.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/\n|\r/g, '\n')}', TextStyle.${this.textStyle}, ${this.renderFrame()})`
  }
}

class Link extends Component {
  target: string
  constructor (layer: AnyLayer, target: string) {
    super(layer, 'link')
    this.target = target
  }

  format (name: string, imports: Imports): string {
    addImport(imports, `src/styles/component/${this.target}`, this.target)
    addImport(imports, 'src/styles/Component', 'Link')
    return `  ${name} = new Link(${this.target}, ${this.renderFrame()})`
  }
}

const DEFAULT_ARROWHEAD = 'None'
const DEFAULT_LINE_END = 'Projecting'
const DEFAULT_LINE_JOIN = 'Miter'

class Polygon extends Component {
  fills: Fill[]
  borders: Border[]
  borderOptions: BorderOptions

  constructor (layer: ShapePath) {
    super(layer, 'Polygon')
    this.fills = layer.style.fills.filter(fill => fill.enabled)
    this.borders = layer.style.borders.filter(border => border.enabled)
    this.borderOptions = layer.style.borderOptions
  }

  format (name: string, imports: Imports, getColor: FGetColor): string {
    addImport(imports, 'src/styles/Component', 'Polygon')
    return `  ${name} = new Polygon(${this.renderFrame()}, ${this.renderFills(imports, getColor)}, ${this.renderBorders(imports, getColor)})`
  }

  renderBorders (imports, getColor: FGetColor): string {
    if (this.borders.length === 1) {
      return this.renderBorder(this.borders[0], imports, getColor)
    }
    // TODO: multiple borders.
    return 'null'
  }

  renderBorder (border: Border, imports: Imports, getColor: FGetColor): string {
    const options = this.borderOptions
    const props = [
      ['fill', this.renderFill(border, imports, getColor)],
      ['thickness', border.thickness]
    ]
    if (options.endArrowhead !== DEFAULT_ARROWHEAD) {
      props.push(['endArrowhead', `'${options.endArrowhead}'`])
    }
    if (options.startArrowhead !== DEFAULT_ARROWHEAD) {
      props.push(['startArrowhead', `'${options.startArrowhead}'`])
    }
    if (options.lineEnd !== DEFAULT_LINE_END) {
      props.push(['lineEnd', `'${options.lineEnd}'`])
    }
    if (options.lineJoin !== DEFAULT_LINE_JOIN) {
      props.push(['lineJoin', `'${options.lineJoin}'`])
    }
    if (options.dashPattern.length > 0) {
      props.push(['dashPattern', `[ ${options.dashPattern.join(', ')} ]`])
    }
    return `{ ${props.map(([prop, value]) => `
  ${prop}: ${value}`).join(',')}
}`
  }

  renderFills (imports: Imports, getColor: FGetColor): string {
    if (this.fills.length === 1) {
      return this.renderFill(this.fills[0], imports, getColor)
    }
    // TODO: multiple fills
    return 'null'
  }

  renderFill (fill: Fill, imports: Imports, getColor: FGetColor): string {
    if (fill.fillType === FillType.Color) {
      return getColor(fill.color, imports)
    }
    if (fill.fillType === FillType.Gradient) {
      return `{ gradient: {
  type: '${fill.gradient.gradientType}',
  stops: [${fill.gradient.stops.map(stop => `
    color: ${getColor(stop.color)},
    position: ${stop.position},
    lineHeight: ${stop.lineHeight},
    textColor: ${getColor(stop.textColor)}
  }`)}],
  from: {
    x: ${fill.gradient.from.x},
    y: ${fill.gradient.from.y}
  },
  to: {
    x: ${fill.gradient.to.x},
    y: ${fill.gradient.to.y}
  }
}}`
    }
    if (fill.fillType === FillType.Pattern) {
      // This requires for the image of all gradient patterns to be
      // somehow packed into the app.
      return JSON.stringify({ error: 'pattern is still todo' })
    }
    return JSON.stringify({ error: `fill type ${fill.fillType} is unknown` })
  }
}

function classForTarget (target: string): string {
  return `${target}Class`
}

type TComponentItem = Image | TextComponent | Link | Polygon

interface IComponent {
  name: string
  artboard: Artboard
  items: { [name: string]: TComponentItem }
}

function collectComponents (document: Document, textStyles: { [id: string]: string }): { [path: string]: IComponent } {
  const components = {}
  let component: IComponent
  iterateDocument(document, (layer, parentNames): boolean => {
    if (parentNames.length === 0) {
      if (isArtboard(layer) && layer.exportFormats.length === 0) {
        component = {
          name: childName(layer.name),
          artboard: layer,
          items: {}
        }
        components[component.name] = component
        return false
      } else {
        component = undefined
        return true
      }
    }
    if (layer.hidden) {
      return true
    }
    if (component === undefined) {
      return true
    }
    const name = childName(layer.name)
    if (layer.exportFormats.length > 0) {
      component.items[name] = new Image(layer)
      return
    }
    if (isSymbolInstance(layer)) {
      const master = document.getSymbolMasterWithID(layer.symbolId)
      if (isIgnored(master)) {
        return
      }
      if (master.exportFormats.length > 0) {
        component.items[name] = new Image(layer, childName(master.name))
      } else {
        component.items[name] = new Link(layer, childName(master.name))
      }
      return
    }
    if (isShapePath(layer) && layer.name === 'borderTop') {
      if (layer.shapeType === ShapeType.Custom) {
        component.items[name] = new Polygon(layer)
      }
    }
    if (isTextLayer(layer)) {
      const style = textStyles[layer.sharedStyleId]
      if (style !== undefined) {
        component.items[name] = new TextComponent(layer, style)
      }
    }
  })
  return components
}

function renderComponent (component: IComponent, getColor: FGetColor): string {
  const imports: Imports = {}
  addImport(imports, 'src/styles/Component', 'Component')
  const body = Object.keys(component.items).map(name => component.items[name].format(name, imports, getColor)).join('\n')
  const constructorBody = `super('${component.name}', ${component.artboard.frame.width}, ${component.artboard.frame.height}${component.artboard.background.enabled ? `, ${getColor(component.artboard.background.color, imports)}` : ''})`

  return `${disclaimer}
${renderImports(imports, 'src/styles/component')}

export class ${classForTarget(component.name)} extends Component {
${body}
  constructor () {
    ${constructorBody}
  }
}

export const ${component.name} = new ${component.name}Class()
`
}

export function writeComponents (document: Document, target: (path: string) => string, textStyles: { [id: string]: string }): void {
  const components = collectComponents(document, textStyles)
  const getColor = getColorFactory(document)
  let hasComponent = false
  for (const name in components) {
    hasComponent = true
    write(target(`src/styles/component/${name}.ts`), renderComponent(components[name], getColor))
  }
  if (hasComponent) {
    write(target('src/styles/Component.ts'), `${disclaimer}
import { ITextStyle } from './TextStyle'
import { Asset } from '../Asset'

export class Component {
  name: string
  backgroundColor: string | undefined
  width: number
  height: number
  constructor (name: string, width: number, height: number, backgroundColor?: string) {
    this.name = name
    this.backgroundColor = backgroundColor
    this.width = width
    this.height = height
  }
}

export interface IFrameData {
  x: number
  y: number
  w: number
  h: number
}

export class Placement {
  x: number
  left: number
  y: number
  top: number
  right: number
  bottom: number
  width: number
  height: number

  constructor({ x, y, w, h }: IFrameData) {
    this.x = x
    this.left = x
    this.y = y
    this.top = y
    this.width = w
    this.right = this.x + w
    this.height = h
    this.bottom = y + h
  }

  ySpace (other: Placement): number {
    if (this.y > other.y) {
      return other.ySpace(this)
    }
    return other.top - this.bottom
  }

  xSpace (other: Placement): number {
    if (this.x > other.x) {
      return other.xSpace(this)
    }
    return other.x - this.right
  }
}

export class AssetPlacement {
  place: Placement
  asset: () => Asset

  constructor (asset: () => Asset, frame: IFrameData) {
    this.asset = asset
    this.place = new Placement(frame)
  }
  img () {
    this.asset().img()
  }
}

export class Link <T> {
  place: Placement
  component: T

  constructor (component: T, frame: IFrameData) {
    this.component = component
    this.place = new Placement(frame)
  }
}

export type TFillData = string | IGradient | IError
export interface IStop {
  color: string
  position: number
}

export interface IGradient {
  gradient: {
    type: 'linear',
    stops: IStop[],
    from: {
      x: number,
      y: number
    },
    to: {
      x: number,
      y: number
    }
  }
}
export function isError (err: any): err is IError {
  if (err === null || typeof err !== 'object') {
    return false
  }
  return err.error !== undefined
}

export interface IError {
  error: string
}

export type TArrowHead = 'None' | 'OpenArrow' | 'FilledArrow' | 'Line' | 'OpenCircle' | 'FilledCircle' | 'OpenSquare' | 'FilledSquare'
export type TLineEnd = 'Butt' | 'Round' | 'Projecting'
export type TLineJoin = 'Miter' | 'Round' | 'Bevel'

export interface TBorderData {
  fill: TFillData,
  thickness: number
  endArrowhead?: TArrowHead
  startArrowhead?: TArrowHead
  lineEnd?: TLineEnd
  lineJoin?: TLineJoin
  dashPattern?: number[]
}

const reg = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?/ig
const hex = (c: number): string => (c >= 0x10) ? c.toString(16) : \`0\${c.toString(16)}\`

export class RGBA {
  r: number
  g: number
  b: number
  a: number
  constructor (string: string) {
    reg.lastIndex = 0
    const parts = reg.exec(string)
    this.r = parts ? parseInt(parts[1], 16) : 255
    this.g = parts ? parseInt(parts[2], 16) : 255
    this.b = parts ? parseInt(parts[3], 16) : 255
    this.a = parts && parts[4] ? parseInt(parts[4], 16) : 255
  }
  toString (): string {
    return \`#\${hex(this.r | 0)}\${hex(this.g | 0)}\${hex(this.b | 0)}\${hex(this.a | 0)}\`
  }
  avg (other: RGBA): this {
    this.r = (this.r + other.r) / 2
    this.g = (this.g + other.g) / 2
    this.b = (this.b + other.b) / 2
    this.a = (this.a + other.a) / 2
    return this
  }
}

function calcAvgColor (stops: IStop[]): string {
  let rgba: RGBA
  for (const stop of stops) {
    const col = new RGBA(stop.color)
    if (rgba === undefined) {
      rgba = col
    } else {
      rgba = rgba.avg(col)
    }
  }
  return rgba.toString()
}

export class Fill {
  data: TFillData
  color: string
  constructor (data: TFillData) {
    this.data = data
    if (this.data === null || isError(this.data)) {
      this.color = '#ffffffff'
    } else if (typeof this.data === 'string') {
      this.color = this.data
    } else {
      this.color = calcAvgColor(this.data.gradient.stops)
    }
  }
}

export class Border {
  endArrowhead: TArrowHead
  startArrowhead: TArrowHead
  lineEnd: TLineEnd
  lineJoin: TLineJoin
  dashPattern: number[]
  fill: Fill
  thickness: number
  constructor (options: TBorderData | null) {
    this.fill = new Fill(options === null ? null : options.fill)
    this.thickness = options === null ? 0 : options.thickness
    this.endArrowhead = options === null || options.endArrowhead === undefined ? 'None' : options.endArrowhead
    this.startArrowhead = options === null || options.startArrowhead === undefined ? 'None' : options.startArrowhead
    this.lineEnd = options === null || options.lineEnd === undefined ? 'Projecting' : options.lineEnd
    this.lineJoin = options === null || options.lineJoin === undefined ? 'Miter' : options.lineJoin
    this.dashPattern = options === null || options.dashPattern === undefined ? [] : options.dashPattern
  }
}

export class Polygon {
  place: Placement
  fill: Fill
  border: Border

  constructor (frame: IFrameData, fill: TFillData | null, border: TBorderData | null) {
    this.place = new Placement(frame)
    this.fill = new Fill(fill)
    this.border = new Border(border)
  }
}

export class Text {
  text: string
  style: ITextStyle
  place: Placement

  constructor (text: string, style: ITextStyle, frame: IFrameData) {
    this.text = text
    this.style = style
    this.place = new Placement(frame)
  }
}
`)
  }
}
