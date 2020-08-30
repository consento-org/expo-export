import { Document, Artboard, Text, AnyLayer, ShapePath, Fill, Border, BorderOptions, Shadow, Style, GradientType, SymbolInstance, Override } from 'sketch/dom'
import { iterateDocument, isTextLayer, isArtboard, isSymbolInstance, isIgnored, isShape, isShapePath, isSlice9, FillType, isTextOverride } from '../util/dom'
import { write, readPluginAsset, IConfig } from '../util/fs'
import { getColorFactory, FGetColor } from './color'
import { Imports, addImport, renderImports } from '../util/render'
import { toMaxDecimals } from '../util/number'
import { childName } from '../util/string'
import { disclaimer } from './disclaimer'
import { TIDLookup, TIDData, getTextFormatRenderProps, formatFontProps } from './text/renderHierarchy'
import { ITextFormat } from './text/TextFormat'
import { processStyle } from './text/collectTextStyles'

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

const compareTextProps = formatFontProps.filter(prop => prop !== 'fontFamily')

function compareTextFormat (base: ITextFormat, target: ITextFormat): ITextFormat {
  let difference: ITextFormat = null
  compareTextProps.forEach(key => {
    if (target[key] !== base[key] && target[key] !== null && target[key] !== undefined) {
      if (difference === null) {
        difference = {}
      }
      difference[key] = target[key]
    }
  })
  return difference
}

function safeText (input: string): string {
  return input.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/(\n|\r)/g, '\\n')
}

class TextComponent extends Component {
  _layer: Text
  text: string
  textStyle: TIDData

  constructor (layer: Text, textStyle: TIDData) {
    super(layer, 'text')
    this._layer = layer
    this.text = layer.text
    this.textStyle = textStyle
  }

  format (name: string, imports: Imports, getColor: FGetColor): IComponentPropertyFormat {
    addImport(imports, 'src/styles/Component', 'Text')
    return {
      property: `  ${name}: Text`,
      init: `
    this.${name} = new Text('${safeText(this.text)}', ${this.renderTextStyle(imports, getColor)}, ${this.renderFrame()}, this)`
    }
  }

  renderTextStyle (imports: Imports, getColor: FGetColor): string {
    const layerStyle = processStyle(this._layer.style)
    if (this.textStyle === undefined) {
      return `{
      ${getTextFormatRenderProps(layerStyle, getColor, imports).join(',\n      ')}
    }`
    }
    addImport(imports, 'src/styles/TextStyles', 'TextStyles')
    const difference = compareTextFormat(this.textStyle.style, layerStyle)
    if (difference === null) {
      return `TextStyles.${this.textStyle.name}`
    }
    return `{
      ...TextStyles.${this.textStyle.name},
      ${getTextFormatRenderProps(difference, getColor, imports).join(',\n      ')}
    }`
  }
}

interface ITextOverride {
  path: string
  value: string
}

function collectName (document: Document, override: Override<Text>): string {
  var paths = override.path.split('/')
  var prefix = ''
  while (paths.length > 1) {
    var parent = paths.shift()
    var parentLayer = document.getLayerWithID(parent)
    prefix += String(parentLayer.name) + '-'
  }
  return childName(prefix + override.affectedLayer.name)
}

class Link extends Component {
  target: string
  textOverrides: ITextOverride[]
  document: Document

  constructor (document: Document, layer: SymbolInstance, target: string) {
    super(layer, 'link')
    this.target = target
    this.document = document
    this.textOverrides = layer.overrides
      .map(override => isTextOverride(override) ? override : null)
      .filter(override => override !== null && !override.isDefault)
      .map(override => {
        return {
          path: collectName(document, override),
          value: override.value
        }
      })
  }

  format (name: string, imports: Imports): IComponentPropertyFormat {
    addImport(imports, `src/styles/component/${this.target}`, this.target)
    addImport(imports, 'src/styles/Component', 'Link')
    return {
      property: `  ${name} = new Link(${this.target}, ${this.renderFrame()}, ${this.renderTextOverrides()})`
    }
  }

  renderTextOverrides (): string {
    if (this.textOverrides.length === 0) {
      return '{}'
    }
    return `{
    ${this.textOverrides.map(override => `${override.path}: '${safeText(override.value)}'`).join(',\n    ')}
  }`
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

function mapGradientType (input: GradientType): 'linear' | 'radial' | 'angular' {
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

  format (name: string, imports: Imports, getColor: FGetColor): IComponentPropertyFormat {
    addImport(imports, 'src/styles/Component', 'Polygon')
    return {
      property: `  ${name}: Polygon`,
      init: `
    this.${name} = new Polygon(${this.renderFrame()}, ${this.renderFills(imports, getColor)}, ${this.renderBorders(imports, getColor)}, ${this.renderShadows(imports, getColor)}, this)`
    }
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
    if (this.borderRadius > 0) {
      props.push(['radius', `${this.borderRadius}`])
    }
    return `{${props.map(([prop, value]) => `
      ${prop}: ${value}`).join(',')}
    }`
  }

  renderShadows (imports: Imports, getColor: FGetColor): string {
    if (this.shadows.length === 0) {
      return '[]'
    }
    const shadows = []
    for (const shadow of this.shadows) {
      shadows.push(`{ x: ${shadow.x}, y: ${shadow.y}, blur: ${shadow.blur}, spread: ${shadow.spread}, color: ${getColor(shadow.color, imports)} }`)
    }
    return `[
      ${shadows.join(',\n      ')}
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
      addImport(imports, 'src/styles/Component', 'GradientType')
      return `{
      gradient: {
        type: GradientType.${mapGradientType(fill.gradient.gradientType)},
        stops: [${fill.gradient.stops.map(stop => `{
          color: ${getColor(stop.color, imports)},
          position: ${stop.position}
        }`).join(', ')}],
        from: {
          x: ${fill.gradient.from.x},
          y: ${fill.gradient.from.y}
        },
        to: {
          x: ${fill.gradient.to.x},
          y: ${fill.gradient.to.y}
        }
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

function classForTarget (target: string): string {
  return `${target.charAt(0).toUpperCase()}${target.substr(1)}Class`
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

function collectComponents (document: Document, textStyles: TIDLookup, config: IConfig): { [path: string]: IComponent } {
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
    if (layer.hidden && !config.exportHidden) {
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
        component.items[name] = new Link(document, layer, masterName)
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
      component.items[name] = new TextComponent(layer, style)
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

/* eslint-disable lines-between-class-members */
export class ${classForTarget(component.name)} extends Component {
${body}
  constructor () {${constructorBody}
  }
}

export const ${component.name} = new ${classForTarget(component.name)}()
`
}

export function writeComponents (document: Document, target: (path: string) => string, textStyles: TIDLookup, config: IConfig): void {
  const components = collectComponents(document, textStyles, config)
  const getColor = getColorFactory(document)
  let hasComponent = false
  for (const name in components) {
    hasComponent = true
    write(target(`src/styles/component/${name}.ts`), renderComponent(components[name], getColor))
  }
  if (hasComponent) {
    write(target('src/styles/Component.tsx'), `${disclaimer}
${readPluginAsset('styles/Component.tsx').toString()}`)
  }
}
