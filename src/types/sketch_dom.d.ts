declare module "sketch/dom" {
  export class ColorAsset {
    type: 'ColorAsset'
    name: string
    color: string
  }
  export class GradientAsset {
    type: 'GradientAsset'
    name: string
    gradient: Gradient
  }
  export class GradientStop {
    color: string
    position: number
    textColor: string
    lineHeight?: number
  }
  export class Gradient {
    stops: GradientStop[]
    gradientType: 'linear'
    to: {
      x: number,
      y: number
    }
    aspectRatio: number
    from: {
      x: number,
      y: number
    }
  }
  export class Fill {
    fillType: 'Color' | 'Gradient'
    enabled: boolean
    gradient: Gradient
    color: string
  }
  export class Border {
    thickness: number
    fillType: 'Color'
    enabled: boolean
    gradient: Gradient
    position: 'Center'
    color: string
  }
  export class Blur {
    radius: number
    motionAngle: number
    enabled: boolean
    blurType: 'Gaussian' | 'Motion'
    center: {
      x: number
      y: number
    }
  }
  export class Shadow {
    x: number
    y: number
    color: string
    blur: number
    enabled: boolean
    spread: number
  }
  export enum BlendingMode {
    NORMAL='normal',
    DARKEN='Darken',
    MULTIPLY='Multiply',
    COLOR_BURN='ColorBurn',
    LIGHTEN='Lighten',
    SCREEN='Screen',
    COLOR_DODGE='ColorDodge',
    OVERLAY='Overlay',
    SOFT_LIGHT='SoftLight',
    HARD_LIGHT='HardLight',
    DIFFERENCE='Difference',
    EXCLUSION='Exclusion',
    HUE='Hue',
    SATURATION='Saturation',
    COLOR='Color',
    LUMINOSITY='Luminosity',
    PLUS_DARKER=16,
    PLUS_LIGHTER=17
  }
  export class Style {
    id: string
  }
  export class TextStyle extends Style {
    fills: Fill[]
    verticalAlignment: 'center' | 'top' | 'bottom'
    textColor: string
    borders: Border[]
    lineHeight: number
    textTransform: 'uppercase' | 'lowercase' | 'none'
    blendingMode: BlendingMode
    styleType: 'Text'
    shadows: Shadow[]
    innerShadows: Shadow[]
    blur: Blur
    opacity: number // 0 ~ 1
    fontSize: number
    fontFamily: string
    paragraphSpacing: number
    kerning: number
    fontWeight: number
    alignment: 'center' | 'right' | 'left' | 'justified'
    textUnderline?: 'single'
    textStrikethrough?: 'single'
    fontStyle?: 'italic' | 'bold'
  }
  export class SharedStyle<T extends Style> {
    id: string
    name: string
    styleType: 'Style'
    style: T
  }

  export interface IIdentifyable {
    id: string
    type: string
    name: string
  }

  export interface ISelectable extends IIdentifyable {
    selected: boolean
    sharedStyleId: string
  }

  export interface ITreeItem extends ISelectable {
    frame: {
      x: number
      y: number
      width: number
      height: number
    }
    exportFormats: ExportFormat[]
  }

  abstract class Identifyable {
    id: string
    name: string
  }

  abstract class Selectable extends Identifyable {
    selected: boolean
    sharedStyleId: string
  }

  abstract class TreeItem extends Selectable {
    frame: Rectangle
    exportFormats: ExportFormat[]
  }

  export class Layer extends TreeItem implements ITreeItem {
    hidden: boolean
    locked: boolean
    type: string
  }

  export interface ILayerContainer {
    layers: Layer[]
  }

  abstract class TreeLeaf extends Layer {
    layers: Layer[]
  }

  export interface ITreeLeaf extends ITreeItem, ILayerContainer {}

  export interface IVisibleLayer extends Layer {
    hidden: boolean
    locked: boolean
  }

  export class Artboard extends Layer {
    type: 'Artboard'
    background: {
      enabled: boolean
      includedInExport: boolean
      color: string
    }
  }
  
  export class Rectangle {
    x: number
    y: number
    width: number
    height: number
  }

  export class Override {
    path: string
    property: 'stringValue' | 'symbolID' | 'layerStyle' | 'textStyle' | 'flowDestination' | 'image'
    // The unique ID of the override (${path}_${property}).
    id: string
    value: string | ImageData
    isDefault: boolean
    affectedLayer: Text | Image | Symbol
    editable: boolean
    getFrame (): Rectangle
  }

  export class SymbolInstance extends Layer {
    text: 'SymbolInstance'
    symbolId: string
  }

  export class SymbolMaster extends Artboard {
    text: 'SymbolMaster'
    symbolId: string
    overrides: Override[]
  }

  export class Group extends TreeLeaf implements IVisibleLayer {
    type: 'Group'
    transform: {
      flippedVertically: false
      flippedHorizontally: false
      rotation: number
    }
  }

  export enum FileFormat {
    eps = 'eps',
    svg = 'svg',
    jpg = 'jpg',
    tiff = 'tiff',
    png = 'png',
    gif = 'gif',
    webp = 'webp',
    pdf = 'pdf'
  }

  export class ExportFormat {
    size: string
    suffix?: string
    prefix?: string
    type: 'ExportFormat'
    fileFormat: FileFormat
  }

  export class Text extends Layer {
    type: 'Text'
    style: TextStyle
    fixedWidth: number
    text: string
    lineSpacing: number
  }

  export interface NSImage {
    nsdata: any
  }

  export interface ImageData extends Identifyable {
    nsimage: NSImage
  }

  export class Image extends Layer {
    image: ImageData
  }

  export class Page extends Selectable implements ISelectable, ILayerContainer {
    layers: Layer[]
    type: 'Page'
  }

  export class Document {
    pages: Page[]
    static getSelectedDocument (): Document | undefined
    static getDocuments(): Document[]
    path: string
    id: string
    colors: ColorAsset[]
    gradients: GradientAsset[]
    sharedTextStyles: SharedStyle<TextStyle>[]
    getSymbolMasterWithID(symbolId: string): SymbolMaster
    getSymbols(): SymbolMaster[]
  }

  export interface IExportOptions {
    formats?: string
    scales?: string
    'use-id-for-name'?: boolean
    'group-contents-only'?: boolean
    overwriting?: boolean
    trimmed?: boolean
    'save-for-web'?: boolean
    compact?: boolean
    'include-namespaces'?: boolean
    progressive?: boolean
    compression?: number
  }
  export interface IDirectExportOptions extends IExportOptions {
    output: false | 0
  }
  export interface INamedExportOptions extends IExportOptions {
    output: string | undefined
  }

  export interface ISketch {
    export (obj: Layer[] | Page[], opts: IDirectExportOptions): Buffer[]
    export (obj: Layer | Page, opts: IDirectExportOptions): Buffer
    export (obj: Layer | Page | Layer[] | Page[], opts: INamedExportOptions): void
  }
  const sketch: ISketch
  export default sketch
}
