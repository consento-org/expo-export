declare module "sketch/dom" {
  enum Type {
    document = 'Document',
    page = 'Page',
    instance = 'SymbolInstance',
    master = 'SymbolMaster',
    text = 'Text',
    image = 'Image',
    group = 'Group',
    artboard = 'Artboard',
    shape = 'Shape',
    shapePath = 'ShapePath',
    hotSpot = 'HotSpot',
    slice = 'Slice',
    exportFormat = 'ExportFormat',
    colorAsset = 'ColorAsset',
    gradientAsset = 'GradientAsset'
  }
  
  export class ColorAsset {
    type: Type.colorAsset
    name?: string
    color: string
  }
  export class GradientAsset {
    type: Type.gradientAsset
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

  export interface Pattern {
    patternType: PatternFillType
    image: ImageData
    tileScale: number | null
  }

  export type FillType = 'Color' | 'Gradient' | 'Pattern'

  export type PatternFillType = 'Tile' | 'Fill' | 'Stretch' | 'Fit'

  export type BorderPosition = 'Center' | 'Inside' | 'Outside'

  export class Fill {
    fillType: FillType
    enabled: boolean
    gradient: Gradient
    color: string
    pattern: Pattern
  }

  export class Border extends Fill {
    position: BorderPosition
    thickness: number
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
    fills: Fill[]
    borders: Border[]
    blendingMode: BlendingMode
    shadows: Shadow[]
    innerShadows: Shadow[]
    blur: Blur
  }
  export class TextStyle extends Style {
    verticalAlignment: 'center' | 'top' | 'bottom'
    textColor: string
    lineHeight: number | null
    textTransform: 'uppercase' | 'lowercase' | 'none'
    styleType: 'Text'
    opacity: number // 0 ~ 1
    fontSize: number
    fontFamily: string
    paragraphSpacing: number
    kerning: number | null
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
  class ShapeStyle extends Style {
    borderOptions: BorderOptions
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


  export type AnyLayer = SymbolInstance | SymbolMaster | Text | Image | Group | Artboard | Shape | ShapePath | HotSpot | Slice
  export type AnyGroup = Group | Page | Artboard
  interface LayerParent extends Group<Type.group | Type.page, Page | LayerParent> {}
  export type AnyParent = Document | LayerParent

  export class Layer<Type extends string, Parent = LayerParent> extends TreeItem implements ITreeItem {
    hidden: boolean
    locked: boolean
    type: Type
    index: number
    parent: Parent | undefined
    duplicate (): Layer<Type, Parent>
    remove (): this
    moveToFront (): this
    moveForward (): this
    moveToBack (): this
    moveBackward (): this
    getParentPage (): Page | undefined
    getParentArtboard (): Artboard | undefined
    getParentSymbolMaster (): SymbolMaster | undefined
  }

  export class Artboard extends Group<Type.artboard> {
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

  export class Shape extends Layer<Type.shape> {
    style: ShapeStyle
    layers: ShapePath[]
  }

  export type CurvePointType = 'Undefined' | 'Straight' | 'Mirrored' | 'Asymmetric' | 'Disconnected'

  export class CurvePoint {
    pointType: CurvePointType
    cornerRadius: number
    type: 'CurvePoint'
    point: {
      x: number
      y: number
    }
    curveTo: {
      x: number
      y: number
    }
    curveFrom: {
      x: number
      y: number
    }
  }

  export type ShapeType = 'Rectangle' | 'Oval' | 'Triangle' | 'Polygon' | 'Star' | 'Custom'
  export type ArrowHead = 'None' | 'OpenArrow' | 'FilledArrow' | 'Line' | 'OpenCircle' | 'FilledCircle' | 'OpenSquare' | 'FilledSquare'
  export type LineEnd = 'Butt' | 'Round' | 'Projecting'
  export type LineJoin = 'Miter' | 'Round' | 'Bevel'

  export class BorderOptions {
    startArrowhead: ArrowHead
    endArrowhead: ArrowHead
    dashPattern: number[]
    lineEnd: LineEnd
    lineJoin: LineJoin
  }

  export class ShapePath extends Layer<Type.shapePath> {
    points: CurvePoint[]
    shapeType: ShapeType
    style: ShapeStyle
    borderOptions: BorderOptions
  }

  export class HotSpot extends Layer<Type.hotSpot> {
  }

  export class Slice extends Layer<Type.slice> {
  }

  export class SymbolInstance extends Layer<Type.instance> {
    symbolId: string
  }

  export class SymbolMaster extends Layer<Type.master> {
    symbolId: string
    overrides: Override[]
  }

  export class Group<Type extends string = Type.group, Parent = LayerParent>  extends Layer<Type, Parent> {
    layers: AnyLayer[]
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
    type: Type.exportFormat
    fileFormat: FileFormat
  }

  export class Text extends Layer<Type.text> {
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

  export class Image extends Layer<Type.image> {
    image: ImageData
  }

  export class Page extends Group<Type.page, Document> {
    parent: Document
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
    export (obj: AnyLayer[] | Page[], opts: IDirectExportOptions): Buffer[]
    export (obj: AnyLayer | Page, opts: IDirectExportOptions): Buffer
    export (obj: AnyLayer | Page | AnyLayer[] | Page[], opts: INamedExportOptions): void
  }
  const sketch: ISketch
  export default sketch
}
