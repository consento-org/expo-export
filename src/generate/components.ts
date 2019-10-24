import { Document, Artboard, AnyLayer } from 'sketch/dom'
import { iterateDocument, isTextLayer, isArtboard, isSymbolInstance, isIgnored } from '../util/dom'
import { write } from '../util/fs'
import { getColorFactory, FGetColor } from './color'
import { Imports, addImport, renderImports } from '../util/render'
import { childName } from '../util/string'

abstract class Component {
  layer: AnyLayer
  type: string

  constructor (layer: AnyLayer, type: string) {
    this.layer = layer
    this.type = type
  }

  abstract format (name: string, imports: Imports): string

  renderFrame (): string {
    return `{ x: ${toMaxDecimals(this.layer.frame.x, 2)}, y: ${toMaxDecimals(this.layer.frame.y, 2)}, w: ${toMaxDecimals(this.layer.frame.width, 2)}, h: ${toMaxDecimals(this.layer.frame.height, 2)} }`
  }
}

class Image extends Component {
  constructor (layer: AnyLayer) {
    super(layer, 'image')
  }

  format (name: string, imports: Imports): string {
    addImport(imports, 'src/Asset', 'Asset')
    return `  ${name} () {
    return Asset.${name}()
  }`
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

  format (name: string, imports: Imports): string {
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
    return `  ${name} = ${this.target}`
  }
}

type TComponentItem = Image | TextComponent | Link

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
      if (isArtboard(layer)) {
        component = {
          name: assetNameForLayer(layer),
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
    if (component === undefined) {
      return true
    }
    if (layer.exportFormats.length > 0) {
      component.items[assetNameForLayer(layer)] = new Image(layer)
      return
    }
    if (isSymbolInstance(layer)) {
      const master = document.getSymbolMasterWithID(layer.symbolId)
      if (isIgnored(master)) return
      component.items[assetNameForLayer(layer)] = new Link(layer, assetNameForLayer(master))
      return
    }
    if (isTextLayer(layer)) {
      const style = textStyles[layer.sharedStyleId]
      if (style !== undefined) {
        component.items[assetNameForLayer(layer)] = new TextComponent(layer, style)
      }
    }
  })
  return components
}

function renderComponent (component: IComponent, getColor: FGetColor): string {
  const imports: Imports = {}
  addImport(imports, 'src/styles/Component', 'Component')
  const body = Object.keys(component.items).map(name => component.items[name].format(name, imports)).join('\n')
  const constructorBody = `super('${component.name}'${component.artboard.background.enabled ? `, ${getColor(component.artboard.background.color, imports)}` : ''})`

  return `${renderImports(imports, 'src/styles/component')}

class ${component.name}Class extends Component {
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
    write(target('src/styles/Component.ts'), `import { ITextStyle } from './TextStyle'

export class Component {
  name: string
  backgroundColor: string | undefined
  constructor (name: string, backgroundColor?: string) {
    this.name = name
    this.backgroundColor = backgroundColor
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
