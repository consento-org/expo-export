import { Document, Artboard, Text, AnyLayer, ShapePath, Fill, Border, BorderOptions, Shadow, Style } from 'sketch/dom'
import { iterateDocument, isTextLayer, isArtboard, isSymbolInstance, isIgnored, isShape, isShapePath, isSlice9, FillType } from '../util/dom'
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

  abstract format (name: string, imports: Imports, getColor: FGetColor): IComponentPropertyFormat

  renderFrame (): string {
    return `{ x: ${toMaxDecimals(this.layer.frame.x, 2)}, y: ${toMaxDecimals(this.layer.frame.y, 2)}, w: ${toMaxDecimals(this.layer.frame.width, 2)}, h: ${toMaxDecimals(this.layer.frame.height, 2)} }`
  }
}

interface IComponentPropertyFormat {
  property: string
  init?: string
}

class Image extends Component {
  asset: string

  constructor (layer: AnyLayer, asset?: string) {
    super(layer, 'image')
    this.asset = asset
  }

  format (name: string, imports: Imports, _: FGetColor): IComponentPropertyFormat {
    addImport(imports, 'src/Asset', 'Asset')
    addImport(imports, 'src/styles/Component', 'ImagePlacement')
    return {
      property: `  ${name}: ImagePlacement`,
      init: `
    this.${name} = new ImagePlacement(Asset.${this.asset === undefined ? name : this.asset}, ${this.renderFrame()}, this)`
    }
  }
}

class Slice9 extends Component {
  asset: string

  constructor (layer: AnyLayer, asset?: string) {
    super(layer, 'image')
    this.asset = asset
  }

  format (name: string, imports: Imports, _: FGetColor): IComponentPropertyFormat {
    addImport(imports, 'src/Asset', 'Asset')
    addImport(imports, 'src/styles/Component', 'Slice9Placement')
    return {
      property: `  ${name}: Text`,
      init: `
    this.${name} = new Slice9Placement(Asset.${this.asset === undefined ? name : this.asset}, ${this.renderFrame()}, this)`
    }
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

  format (name: string, imports: Imports, _: FGetColor): IComponentPropertyFormat {
    addImport(imports, 'src/styles/Component', 'Text')
    addImport(imports, 'src/styles/TextStyles', 'TextStyles')
    return {
      property: `  ${name}: Text`,
      init: `
    this.${name} = new Text('${this.text.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/(\n|\r)/g, '\\n')}', TextStyles.${this.textStyle}, ${this.renderFrame()}, this)`
    }
  }
}

class Link extends Component {
  target: string
  constructor (layer: AnyLayer, target: string) {
    super(layer, 'link')
    this.target = target
  }

  format (name: string, imports: Imports): IComponentPropertyFormat {
    addImport(imports, `src/styles/component/${this.target}`, this.target)
    addImport(imports, 'src/styles/Component', 'Link')
    return {
      property: `  ${name} = new Link(${this.target}, ${this.renderFrame()})`
    }
  }
}

const DEFAULT_ARROWHEAD = 'None'
const DEFAULT_LINE_END = 'Projecting'
const DEFAULT_LINE_JOIN = 'Miter'

function isVisibleColor (color: string): boolean {
  return !/^#[0-9a-f]{6}00$/ig.test(color)
}

function isVisibleFill (fill: Fill): boolean {
  if (!fill.enabled) {
    return false
  }
  if (fill.fillType === 'Color') {
    return isVisibleColor(fill.color)
  }
  return true
}

interface ShapeStyle extends Style {
  borderOptions: BorderOptions
}

function getBorderRadius (layer: ShapePath): number {
  if (layer.shapeType !== 'Rectangle') {
    return 0
  }
  const radius = layer.points[0].cornerRadius
  for (let i = 1; i < layer.points.length; i++) {
    if (layer.points[0].cornerRadius !== radius) {
      return 0
    }
  }
  return radius
}

class Polygon extends Component {
  fills: Fill[]
  borders: Border[]
  borderOptions: BorderOptions
  shadows: Shadow[]
  borderRadius: number

  constructor (layer: ShapePath, style: ShapeStyle) {
    super(layer, 'Polygon')
    this.borderRadius = getBorderRadius(layer)
    this.fills = style.fills.filter(isVisibleFill)
    this.borders = style.borders.filter(border => border.enabled)
    this.borderOptions = style.borderOptions
    this.shadows = style.shadows.filter(shadow => shadow.enabled && isVisibleColor(shadow.color))
  }

  format (name: string, imports: Imports, getColor: FGetColor): IComponentPropertyFormat {
    addImport(imports, 'src/styles/Component', 'Polygon')
    return {
      property: `  ${name} = new Polygon(${this.renderFrame()}, ${this.renderFills(imports, getColor)}, ${this.borderRadius}, ${this.renderBorders(imports, getColor)}, ${this.renderShadows(imports, getColor)})`
    }
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

  renderShadows (imports: Imports, getColor: FGetColor): string {
    if (this.shadows.length === 0) {
      return '[]'
    }
    const shadows = []
    for (const shadow of this.shadows) {
      shadows.push(`{ x:${shadow.x}, y:${shadow.y}, blur:${shadow.blur}, spread:${shadow.spread}, color: ${getColor(shadow.color, imports)} }`)
    }
    return `[
    ${shadows.join(',\n    ')}
  ]`
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

interface IComponent {
  name: string
  artboard: Artboard
  items: { [name: string]: Component }
}

function hasSlice9 (artboard: Artboard): boolean {
  for (let i = 0; i < artboard.layers.length; i++) {
    if (isSlice9(artboard.layers[0])) {
      return true
    }
  }
  return false
}

function isExportedArtboard (artboard: Artboard): boolean {
  if (artboard.exportFormats.length > 0) {
    return true
  }
  return hasSlice9(artboard)
}

function collectComponents (document: Document, textStyles: { [id: string]: string }): { [path: string]: IComponent } {
  const components = {}
  let component: IComponent
  iterateDocument(document, (layer, parentNames): boolean => {
    if (parentNames.length === 0) {
      if (isArtboard(layer) && !isExportedArtboard(layer)) {
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
      const masterName = childName(master.name)
      if (isArtboard(master) && hasSlice9(master)) {
        component.items[name] = new Slice9(layer, masterName)
      } else if (master.exportFormats.length > 0) {
        component.items[name] = new Image(layer, masterName)
      } else {
        component.items[name] = new Link(layer, masterName)
      }
      return
    }
    if (isShape(layer)) {
      if (layer.layers.length === 1) {
        component.items[name] = new Polygon(layer.layers[0], layer.style)
      }
    }
    if (isShapePath(layer)) {
      component.items[name] = new Polygon(layer, layer.style)
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
  const properties = Object.keys(component.items).map(name => component.items[name].format(name, imports, getColor))
  const body = properties.map(property => property.property).join('\n')
  const propertyInit = properties.map(property => property.init).filter(init => init !== undefined).join('')
  const constructorBody = `
    super('${component.name}', ${component.artboard.frame.width}, ${component.artboard.frame.height}${component.artboard.background.enabled ? `, ${getColor(component.artboard.background.color, imports)}` : ''})${propertyInit}`

  return `${disclaimer}
${renderImports(imports, 'src/styles/component')}

export class ${classForTarget(component.name)} extends Component {
${body}
  constructor () {${constructorBody}
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
    write(target('src/styles/Component.tsx'), `${disclaimer}
import React from 'react'
import { ImageAsset, Slice9 } from '../Asset'
import { ImageStyle, TextStyle, Text as NativeText, View, ViewStyle, FlexStyle, TouchableOpacity } from 'react-native'

export type TRenderGravity = 'start' | 'end' | 'center' | 'stretch'
export interface IRenderOptions {
  vert?: TRenderGravity,
  horz?: TRenderGravity,
  onPress?: () => any
}

function applyRenderOptions<T extends FlexStyle> ({ horz, vert }: IRenderOptions = {}, place: Placement, style?: T): T {
  if (style === null || style === undefined) {
    style = {} as T
  }
  style.width = horz === 'stretch' ? '100%' : place.width
  style.height = vert === 'stretch' ? '100%' : place.height
  return style
}

// Todo: LRU?
const renderCache: { [key: string]: ViewStyle } = {}

export class Component {
  name: string
  backgroundColor: string | undefined
  width: number
  height: number
  Text: (props: ITextProps) => JSX.Element

  constructor (name: string, width: number, height: number, backgroundColor?: string) {
    this.name = name
    this.backgroundColor = backgroundColor
    this.width = width
    this.height = height
    this.Text = (props: ITextProps) => this.renderText(props.prototype, {
      vert: props.vert,
      horz: props.horz,
      onPress: props.onPress
    }, props.value, props.style)
  }

  renderText (text: Text, opts?: IRenderOptions, value?: string, style?: TextStyle) {
    style = applyRenderOptions(opts, text.place, style)
    return this._renderItem(text.render(value, style), text.place, opts)
  }

  renderImage (asset: ImagePlacement, opts?: IRenderOptions, style?: ImageStyle) {
    style = applyRenderOptions(opts, asset.place, style)
    if (opts.horz === 'stretch' || opts.vert === 'stretch') {
      style.resizeMode = 'stretch'
    }
    return this._renderItem(asset.img(style), asset.place, opts)
  }

  renderSlice9 (asset: Slice9Placement, opts?: IRenderOptions, style?: ViewStyle) {
    style = applyRenderOptions(opts, asset.place, style)
    return this._renderItem(asset.render(style), asset.place, opts)
  }

  _renderItem (item: React.ReactNode, place: Placement, { horz, vert, onPress }: IRenderOptions = {}) {
    const horzKey = \`horz:\${horz || 'start'}:\${vert || 'start'}:\${this.width}:\${this.height}:\${place.top}:\${place.left}:\${place.right}:\${place.bottom}\`
    let horzStyle = renderCache[horzKey]
    if (horzStyle === undefined) {
      horzStyle = {
        display: 'flex',
        position: 'absolute',
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        justifyContent: horz === 'end' ? 'flex-end' : horz === 'center' ? 'center' : 'flex-start'
      }
      if (horz !== 'start') {
        horzStyle.paddingRight = this.width - place.right
      }
      if (horz !== 'end') {
        horzStyle.paddingLeft = place.left
      }
      if (vert !== 'start') {
        horzStyle.paddingBottom = this.height - place.bottom
      }
      if (vert !== 'end') {
        horzStyle.paddingTop = place.top
      }
      renderCache[horzKey] = horzStyle
    }
    const vertKey = \`vert:\${vert || 'start'}:\${horz || 'start'}\`
    let vertStyle = renderCache[vertKey]
    if (vertStyle === undefined) {
      vertStyle = {
        display: 'flex',
        width: horz === 'stretch' ? '100%' : 'auto',
        flexDirection: 'column',
        height: '100%',
        justifyContent: vert === 'end' ? 'flex-end' : vert === 'center' ? 'center': 'flex-start'
      }
      renderCache[vertKey] = vertStyle
    }
    if (onPress !== null && onPress !== undefined) {
      item = <TouchableOpacity onPress={ onPress }>{ item }</TouchableOpacity>
    }
    return <View style={ horzStyle }><View style={ vertStyle }>{ item }</View></View>
  }
}

export interface IFrameData {
  x: number
  y: number
  w: number
  h: number
}

export interface IStylePlace {
  left?: number | string
  top?: number | string
  width?: number | string
  height?: number | string
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

  dynWidthStyle (): { left: number, top: number, right: number } {
    return {
      left: this.left,
      top: this.top,
      right: this.right
    }
  }

  style<T extends IStylePlace> (style?: T): T {
    if (style === undefined || style === null) {
      style = {} as T
    }
    style.top = this.top
    style.left = this.left
    style.width = this.width
    style.height = this.height
    return style
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

export class ImagePlacement {
  place: Placement
  asset: () => ImageAsset
  parent: Component

  constructor (asset: () => ImageAsset, frame: IFrameData, parent: Component) {
    this.asset = asset
    this.place = new Placement(frame)
    this.parent = parent
  }

  img (style?: ImageStyle) {
    return this.asset().img(style)
  }
}

export class Slice9Placement {
  place: Placement
  asset: () => Slice9
  parent: Component

  constructor (asset: () => Slice9, frame: IFrameData, parent: Component) {
    this.asset = asset
    this.place = new Placement(frame)
    this.parent = parent
  }

  render (style?: ViewStyle) {
    return this.asset().render(style)
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

export type TShadowData = {
  x: number,
  y: number,
  blur: number,
  spread: number,
  color: string
}

export class Shadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string

  constructor (data: TShadowData) {
    this.x = data.x
    this.y = data.y
    this.blur = data.blur
    this.spread = data.spread
    this.color = data.color
  }
}

export class Polygon {
  place: Placement
  fill: Fill
  borderRadius: number
  border: Border
  shadows: Shadow[]

  constructor (frame: IFrameData, fill: TFillData | null, borderRadius: number, border: TBorderData | null, shadows: TShadowData[]) {
    this.place = new Placement(frame)
    this.fill = new Fill(fill)
    this.borderRadius = borderRadius
    this.border = new Border(border)
    this.shadows = shadows.map(data => new Shadow(data))
  }

  borderStyle (): ViewStyle {
    return {
      borderRadius: this.borderRadius,
      borderColor: this.border.fill.color,
      borderWidth: this.border.thickness
    }
  }
}

export class Text {
  text: string
  style: TextStyle
  styleAbsolute: TextStyle
  place: Placement
  parent: Component

  constructor (text: string, style: TextStyle, frame: IFrameData, parent: Component) {
    this.text = text
    this.style = style
    this.parent = parent
    this.place = new Placement(frame)
    this.styleAbsolute = Object.freeze({
      ... style,
      ... this.place.style(),
      position: 'absolute'
    })
  }

  render (value?: string, style?: TextStyle) {
    return <NativeText style={{
      ...this.style,
      ...style
    }}>{ value === undefined ? this.text : String(value) }</NativeText>
  }

  renderAbsolute (value?: string, style?: TextStyle) {
    if (style === undefined || style === null) {
      style = this.styleAbsolute
    } else {
      style = {
        ...style,
        ...this.styleAbsolute
      }
    }
    return this.render(value, style)
  }
}
`)
  }
}
