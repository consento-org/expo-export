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

  export class TreeItem {
    id: string
    name: string
    selected: boolean
    sharedStyleId: string
    frame: {
      x: number
      y: number
      width: number
      height: number
    }
  }

  export class TreeLeaf {
    layers: TreeItem[]
  }

  export class VisibleLeaf {
    hidden: boolean
    locked: boolean
  }

  export class Artboard extends VisibleLeaf {
    type: 'Artboard'
    background: {
      enabled: boolean
      includedInExport: boolean
      color: string
    }
  }

  export class Group extends VisibleLeaf {
    type: 'Group'
    transform: {
      flippedVertically: false
      flippedHorizontally: false
      rotation: number
    }
  }

  export class VisibleItem extends TreeItem {
    hidden: boolean
    locked: boolean
  }

  export class TextLayer extends VisibleItem {
    type: 'Text'
    style: TextStyle
    fixedWidth: number
  }

  export class Page extends TreeLeaf {
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
  }
}
