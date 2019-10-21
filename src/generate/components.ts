import { Document, Artboard } from 'sketch/dom'
import { iterateDocument, isTextLayer, isArtboard, isImage, isSymbolInstance } from '../util/dom'
import { assetNameForLayer } from './assets'
import { write } from '../util/fs'
import { getColorFactory, FGetColor } from './text/renderHierarchy'
import { Imports, addImport, renderImports } from '../util/render'

abstract class Component {
  name: string
  type: string
  constructor (name: string, type: string) {
    this.name = name
    this.type = type
  }

  abstract format (imports: Imports): string
}

class Image extends Component {
  constructor (name: string) {
    super(name, 'image')
  }

  format (imports: Imports): string {
    addImport(imports, 'src/Asset', 'Asset')
    return `  ${this.name} () {
    return Asset.${this.name}()
  }`
  }
}

class TextComponent extends Component {
  text: string
  textStyle: string
  constructor (name: string, text: string, textStyle: string) {
    super(name, 'text')
    this.text = text
    this.textStyle = textStyle
  }

  format (imports: Imports): string {
    addImport(imports, 'src/styles/Component', 'Text')
    addImport(imports, 'src/styles/TextStyle', 'TextStyle')
    return `  ${this.name} = new Text('${this.text.replace(/'/g, "\\'").replace(/\\/g, '\\\\').replace(/\n|\r/g, '\n')}', TextStyle.${this.textStyle})`
  }
}

class Link extends Component {
  target: string
  constructor (name: string, target: string) {
    super(name, 'link')
    this.target = target
  }

  format (imports: Imports): string {
    addImport(imports, `src/styles/component/${this.target}`, this.target)
    return `  ${this.name} = ${this.target}`
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
    const name = assetNameForLayer(layer)
    if (isImage(layer) && layer.exportFormats.length > 0) {
      component.items[assetNameForLayer(layer)] = new Image(name)
      return
    }
    if (isSymbolInstance(layer)) {
      const master = document.getSymbolMasterWithID(layer.symbolId)
      component.items[assetNameForLayer(layer)] = new Link(name, assetNameForLayer(master))
      return
    }
    // console.log(`${parentNames.map(entry => slugify(entry)).join('_')}_${slugify(layer.name)}`)
    if (isTextLayer(layer)) {
      const style = textStyles[layer.sharedStyleId]
      if (style !== undefined) {
        component.items[assetNameForLayer(layer)] = new TextComponent(name, layer.text, style)
      }
    }
  })
  return components
}

function renderComponent (component: IComponent, getColor: FGetColor): string {
  const imports: Imports = {}
  addImport(imports, 'src/styles/Component', 'Component')
  const body = Object.values(component.items).map(item => item.format(imports)).join('\n')
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

export class Text {
  text: string
  style: ITextStyle

  constructor (text: string, style: ITextStyle) {
    this.text = text
    this.style = style
  }
}
`)
  }
}
