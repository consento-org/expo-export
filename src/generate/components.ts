import { Document, Artboard, Text, AnyLayer, ShapePath, Fill, Border, BorderOptions, Shadow, Style, GradientType, SymbolInstance } from 'sketch/dom'
import { isTextLayer, isArtboard, isSymbolInstance, isIgnored, isShape, isShapePath, FillType, recursiveLayers, isExported, hasSlice9, getDesignName, svgLinejoin, svgLinecap } from '../util/dom'
import { GradientType as OutputGradientType } from '../../assets/styles/util/types'
import { IConfig } from '../util/fs'
import { getColorFactory, FGetColor } from './color'
import { Imports, addImport, ITypeScript, isFilled } from '../util/render'
import { toMaxDecimals } from '../util/number'
import { childName } from '../util/string'
import { renderTextStyle } from './text/renderTextStyle'
import { TIDLookup } from './text'
import { ITextStyleEntry, processStyle } from './text/collectStyleHierarchy'
import { SymbolOverride, processOverrides, IOverrides } from './component/overrides'

abstract class Component {
  layer: AnyLayer
  type: string

  constructor (layer: AnyLayer, type: string) {
    this.layer = layer
    this.type = type
  }

  abstract format (designName: string, imports: Imports, getColor: FGetColor): string

  renderFrame (): string {
    const parent = this.layer.getParentArtboard()
    const xNum = toMaxDecimals(this.layer.frame.x, 2)
    const yNum = toMaxDecimals(this.layer.frame.y, 2)
    const bNum = parent !== undefined ? toMaxDecimals(parent.frame.height - this.layer.frame.height - this.layer.frame.y, 2) : 0
    const rNum = parent !== undefined ? toMaxDecimals(parent.frame.width - this.layer.frame.width - this.layer.frame.x, 2) : 0
    const x: string = xNum !== 0 ? `x: ${xNum}, ` : ''
    const y: string = yNum !== 0 ? `y: ${yNum}, ` : ''
    const b: string = bNum !== 0 ? `, b: ${bNum}` : ''
    const r: string = rNum !== 0 ? `, r: ${rNum}` : ''
    return `{ ${x}${y}w: ${toMaxDecimals(this.layer.frame.width, 2)}, h: ${toMaxDecimals(this.layer.frame.height, 2)}${r}${b} }`
  }
}

class Image extends Component {
  asset: string

  constructor (layer: AnyLayer, asset?: string) {
    super(layer, 'image')
    this.asset = asset
  }

  format (designName: string, imports: Imports, _: FGetColor): string {
    addImport(imports, `./src/styles/${designName}/ImageAsset`, 'ImageAsset')
    addImport(imports, './src/styles/util/ImagePlacement', 'ImagePlacement')
    addImport(imports, './src/styles/util/react/SketchImage', [])
    return `new ImagePlacement(ImageAsset.${this.asset === undefined ? name : this.asset}, ${this.renderFrame()})`
  }
}

class Slice9 extends Component {
  asset: string

  constructor (layer: AnyLayer, asset?: string) {
    super(layer, 'image')
    this.asset = asset
  }

  format (designName: string, imports: Imports, _: FGetColor): string {
    addImport(imports, `./src/styles/${designName}/Slice9`, 'Slice9')
    addImport(imports, './src/styles/util/Slice9Placement', 'Slice9Placement')
    addImport(imports, './src/styles/util/react/SketchSlice9', [])
    return `new Slice9Placement(Slice9.${this.asset === undefined ? name : this.asset}, ${this.renderFrame()})`
  }
}

function safeText (input: string): string {
  return input.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/(\n|\r)/g, '\\n')
}

function indentSecondLine (input: string, indent: string): string {
  const lines = input.split('\n')
  for (let i = 1; i < lines.length; i++) {
    lines[i] = `${indent}${lines[i]}`
  }
  return lines.join('\n')
}

class TextComponent extends Component {
  _layer: Text
  text: string
  textStyle: ITextStyleEntry

  constructor (layer: Text, textStyle: ITextStyleEntry) {
    super(layer, 'text')
    this._layer = layer
    this.text = layer.text
    this.textStyle = textStyle
  }

  format (designName: string, imports: Imports, getColor: FGetColor): string {
    addImport(imports, './src/styles/util/TextBox', 'TextBox')
    addImport(imports, './src/styles/util/react/SketchTextBox', [])
    return `new TextBox('${safeText(this.text)}', ${this.renderTextStyle(designName, imports, getColor)}, ${this.renderFrame()})`
  }

  renderTextStyle (designName: string, imports: Imports, getColor: FGetColor): string {
    return indentSecondLine(renderTextStyle(designName, imports, getColor, processStyle(this._layer.style), this.textStyle), '    ')
  }
}

function formatSymbolOverride (textStyles: TIDLookup, designName: string, imports: Imports, indent: string, target: string, frame: string, overrides: IOverrides): string {
  return `new LayerPlacement(${target}, ${target}.layers, ${frame}${
    !isFilled(overrides)
      ? ''
      : `, ({ ${Object.keys(overrides).join(', ')} }) => ({${
        Object.entries(overrides)
          .map(([key, override]): string => {
            if (override instanceof SymbolOverride) {
              const target = override.target !== null ? override.target : `${key}.layer`
              if (override.target !== null) {
                addImport(imports, `./src/styles/${designName}/layer/${target}`, target)
              }
              return `
${indent}  ${key}: ${formatSymbolOverride(textStyles, designName, imports, indent + '  ', target, `${key}.place`, override.overrides)}`
            }
            addImport(imports, './src/styles/util/TextBox', 'TextBox')
            addImport(imports, './src/styles/util/react/SketchTextBox', [])
            let style = `${key}.style`
            if (override.styleID === undefined) {
              const textStyle = textStyles[override.styleID]
              if (textStyle) {
                style = `TextStyles.${textStyle.name}`
              }
            }
            return `
${indent}  ${key}: new TextBox(${override.text !== undefined ? `'${override.text}'` : `${key}.text`}, ${style}, ${key}.place)`
          })
          .join(',')
      }
${indent}})`
  })`
}

class Link extends Component {
  target: string
  textStyles: TIDLookup
  overrides?: IOverrides

  constructor (textStyles: TIDLookup, layer: SymbolInstance, target: string, overrides?: IOverrides) {
    super(layer, 'link')
    this.textStyles = textStyles
    this.target = target
    this.overrides = overrides
  }

  format (designName: string, imports: Imports): string {
    addImport(imports, './src/styles/util/LayerPlacement', 'LayerPlacement')
    addImport(imports, `./src/styles/${designName}/layer/${this.target}`, this.target)
    return formatSymbolOverride(this.textStyles, designName, imports, '    ', this.target, this.renderFrame(), this.overrides)
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

interface ShapeStyle extends Style<ShapeStyle> {
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

function mapGradientType (input: GradientType): OutputGradientType {
  if (input === 'Linear') return 'linear'
  if (input === 'Radial') return 'radial'
  return 'angular'
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

  format (_designName: string, imports: Imports, getColor: FGetColor): string {
    addImport(imports, './src/styles/util/Polygon', 'Polygon')
    addImport(imports, './src/styles/util/react/SketchPolygon', [])
    return `new Polygon(${this.renderFrame()}, ${this.renderFills(imports, getColor)}, ${this.renderBorders(imports, getColor)}, ${this.renderShadows(imports, getColor)})`
  }

  renderBorders (imports, getColor: FGetColor): string {
    if (this.borders.length === 1) {
      return this.renderBorder(this.borders[0], imports, getColor)
    } else if (this.borders.length === 0 && this.borderRadius > 0) {
      return `{ radius: ${this.borderRadius} }`
    }
    // TODO: multiple borders.
    return 'null'
  }

  renderBorder (border: Border, imports: Imports, getColor: FGetColor): string {
    const options = this.borderOptions
    return `{
      fill: ${this.renderFill(border, imports, getColor)},
      thickness: ${border.thickness
      }${options.endArrowhead === DEFAULT_ARROWHEAD ? '' : `,
      endArrowhead: '${options.endArrowhead}'`
      }${options.startArrowhead === DEFAULT_ARROWHEAD ? '' : `,
      startArrowhead: '${options.startArrowhead}'`
      }${options.lineEnd === DEFAULT_LINE_END ? '' : `,
      strokeLinecap: '${svgLinecap(options.lineEnd) as string}'`
      }${options.lineJoin === DEFAULT_LINE_JOIN ? '' : `,
      strokeLinejoin: '${svgLinejoin(options.lineJoin) as string}'`
      }${options.dashPattern.length === 0 ? '' : `,
      dashPattern: [ ${options.dashPattern.join(', ')} ]`
      }${this.borderRadius === 0 ? '' : `,
      radius: ${this.borderRadius}`
      }
    }`
  }

  renderShadows (imports: Imports, getColor: FGetColor): string {
    if (this.shadows.length === 0) {
      return '[]'
    }
    return `[${this.shadows.map(shadow => `
      { x: ${shadow.x}, y: ${shadow.y}, blur: ${shadow.blur}, spread: ${shadow.spread}, color: ${getColor(shadow.color, imports)} }`
    ).join(',')}
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
      return `{
      gradient: {
        type: '${mapGradientType(fill.gradient.gradientType)}',
        stops: [${fill.gradient.stops.map(stop => `
          { color: ${getColor(stop.color, imports)}, position: ${stop.position} }`).join(',')}
        ],
        from: { x: ${fill.gradient.from.x}, y: ${fill.gradient.from.y} },
        to: { x: ${fill.gradient.to.x}, y: ${fill.gradient.to.y} }
      }
    }`
    }
    if (fill.fillType === FillType.Pattern) {
      // This requires for the image of all gradient patterns to be
      // somehow packed into the app.
      return JSON.stringify({ error: 'pattern is still todo' })
    }
    return JSON.stringify({ error: `fill type ${String(fill.fillType)} is unknown` })
  }
}

interface IComponent {
  name: string
  artboard: Artboard
  items: { [name: string]: Component }
}

function collectItem (document: Document, layer: AnyLayer, textStyles: TIDLookup): Component | undefined {
  if (isSymbolInstance(layer)) {
    const master = document.getSymbolMasterWithID(layer.symbolId)
    if (isIgnored(master)) {
      return
    }
    const masterName = childName(master.name)
    if (isArtboard(master)) {
      if (isExported(master)) {
        return new Image(layer, masterName)
      }
      if (hasSlice9(master)) {
        return new Slice9(layer, masterName)
      }
    }
    return new Link(textStyles, layer, masterName, processOverrides(document, layer))
  }
  if (isShape(layer)) {
    if (layer.layers.length === 1) {
      return new Polygon(layer.layers[0], layer.style)
    }
  }
  if (isShapePath(layer)) {
    return new Polygon(layer, layer.style)
  }
  if (isTextLayer(layer)) {
    const style = textStyles[layer.sharedStyleId]
    return new TextComponent(layer, style)
  }
}

function collectItems (document: Document, artboard: Artboard, textStyles: TIDLookup, filter: (layer: AnyLayer) => boolean): { [name: string]: Component } {
  const items: { [name: string]: Component } = {}
  for (const layer of recursiveLayers(artboard, filter)) {
    const item = collectItem(document, layer, textStyles)
    if (item !== undefined) {
      items[childName(layer.name)] = item
    }
  }
  return items
}

function * collectComponents (document: Document, textStyles: TIDLookup, config: IConfig): Generator<IComponent> {
  let filter = (layer: AnyLayer): boolean => !isIgnored(layer)
  if (!config.exportHidden) {
    const _filter = filter
    filter = (layer: AnyLayer) => !layer.hidden || _filter(layer)
  }
  for (const page of document.pages) {
    for (const artboard of page.layers) {
      if (!isArtboard(artboard)) continue
      if (isExported(artboard) || hasSlice9(artboard) || !filter(artboard)) continue
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      yield ({
        name: childName(artboard.name),
        artboard: artboard,
        items: collectItems(document, artboard, textStyles, filter)
      } as IComponent)
    }
  }
}

function renderComponent (designName: string, component: IComponent, getColor: FGetColor): Omit<ITypeScript, 'pth'> {
  const imports: Imports = {}
  addImport(imports, './src/styles/util/react/SketchElement', [])
  return {
    imports,
    code: `
export const ${component.name} = {
  name: '${component.name}',
  width: ${component.artboard.frame.width},
  height: ${component.artboard.frame.height}${
    !component.artboard.background.enabled ? ''
    : `,
  backgroundColor: ${getColor(component.artboard.background.color, imports)}`}${
    !isFilled(component.items) ? '' : `,
  layers: {${Object.keys(component.items).map(name => `
    ${name}: ${component.items[name].format(designName, imports, getColor)}`
).join(',')}
  }`

  }
}
`
  }
}

export function * generateComponents (document: Document, textStyles: TIDLookup, config: IConfig): Generator<ITypeScript> {
  const getColor = getColorFactory(document)
  const designName = getDesignName(document)
  for (const component of collectComponents(document, textStyles, config)) {
    yield {
      ...renderComponent(designName, component, getColor),
      pth: `./src/styles/${designName}/layer/${component.name}.ts`
    }
  }
}
