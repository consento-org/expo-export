import { ImageSourcePropType, TextStyle, FlexStyle } from 'react-native'
import { Placement } from './Placement'

export interface ISize {
  width: number
  height: number
}

export interface IPlacement {
  x: number
  y: number
  w: number
  h: number
  r?: number
  b?: number
}

export function isSketchError (err: any): err is ISketchError {
  if (err === null || typeof err !== 'object') {
    return false
  }
  return typeof err.error === 'string'
}

export interface ISketchError {
  error: string
}

export interface IBaseLayer extends ISize {
  name: string
  backgroundColor?: string | undefined
}

export interface ILayer <Type = any> extends IBaseLayer {
  layers?: Type
}

export interface IImageAsset extends IBaseLayer {
  source: () => ImageSourcePropType
}

export interface IShadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
}

export type ArrowHead = 'None' | 'OpenArrow' | 'FilledArrow' | 'Line' | 'OpenCircle' | 'FilledCircle' | 'OpenSquare' | 'FilledSquare'
export type Linecap = 'butt' | 'square' | 'round'
export type Linejoin = 'miter' | 'bevel' | 'round'
export type BorderStyle = 'dotted' | 'dashed' | 'solid'
export type GradientType = 'linear' | 'radial' | 'angular'
export type RenderGravity = 'start' | 'end' | 'center' | 'stretch' | 'none'

export interface IStop {
  color: string
  position: number
}

export interface IGradient {
  gradient: {
    type: GradientType
    stops: IStop[]
    from: {
      x: number
      y: number
    }
    to: {
      x: number
      y: number
    }
  }
}

export interface IBorder {
  endArrowhead: ArrowHead
  startArrowhead: ArrowHead
  strokeLinecap: Linecap
  strokeLinejoin: Linejoin
  dashPattern: number[]
  fill: IFill
  thickness: number
  radius: number
  borderStyle: BorderStyle
}

export type FillData = string | IGradient | ISketchError | null

export interface IFill {
  data: FillData
  color: string
}

export interface IPolygon {
  place: Placement
  fill: IFill
  borderRadius: number
  border: IBorder
  shadows: IShadow[]
}

export interface ITextBox {
  text: string
  style: TextStyle
  styleAbsolute: TextStyle
  place: Placement
}

export interface ISlice9 extends ILayer {
  slice: Placement
  slices: () => [
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType
  ]
}

export interface IImagePlacement {
  place: Placement
  image: IImageAsset
}

export interface ISlice9Placement {
  place: Placement
  slice9: ISlice9
}

export type SketchType = ILayer | IPolygon | ITextBox | ISlice9 | IImageAsset | IImagePlacement | ISlice9Placement

export function isTextBox (input: SketchType): input is ITextBox {
  return 'text' in input
}

export function isPolygon (input: SketchType): input is IPolygon {
  return 'fill' in input
}

export function isSlice9 (input: SketchType): input is ISlice9 {
  return 'slices' in input
}

export function isImageAsset (input: SketchType): input is IImageAsset {
  return 'name' in input && 'source' in input
}

export function isImagePlacement (input: SketchType): input is IImagePlacement {
  return 'place' in input && 'image' in input
}

export function isSlice9Placement (input: SketchType): input is ISlice9Placement {
  return 'place' in input && 'slice9' in input
}

export function isLayer (input: SketchType): input is ILayer {
  if (isSlice9(input)) return false
  if (isImageAsset(input)) return false
  return 'name' in input
}

type StyleTemplate <TStyle extends FlexStyle, TElement> = (place: Placement, elem: TElement) => TStyle

interface ISketchElementBase <TStyle extends FlexStyle, TSource> {
  style?: TStyle | StyleTemplate<TStyle, TSource>
}

export interface ISketchElementProps <TStyle extends FlexStyle, TSource extends SketchType> extends ISketchElementBase<TStyle, TSource> {
  src: TSource
}
