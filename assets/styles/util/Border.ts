import { ViewStyle } from 'react-native'
import { Fill, TFillData } from './Fill'

export type TArrowHead = 'None' | 'OpenArrow' | 'FilledArrow' | 'Line' | 'OpenCircle' | 'FilledCircle' | 'OpenSquare' | 'FilledSquare'
export type TLineEnd = 'Butt' | 'Round' | 'Projecting'
export type TLineJoin = 'Miter' | 'Round' | 'Bevel'

export interface TBorderData {
  fill?: TFillData
  thickness?: number
  endArrowhead?: TArrowHead
  startArrowhead?: TArrowHead
  lineEnd?: TLineEnd
  lineJoin?: TLineJoin
  dashPattern?: number[]
  radius?: number
}

export enum TBorderStyle {
  dotted = 'dotted',
  dashed = 'dashed',
  solid = 'solid'
}

function dashPatternToBorderStyle (dashPattern: number[]): TBorderStyle {
  if (dashPattern.length === 1) {
    return TBorderStyle.dotted
  }
  if (dashPattern.length === 2) {
    return TBorderStyle.dashed
  }
  return TBorderStyle.solid
}

export class Border {
  endArrowhead: TArrowHead
  startArrowhead: TArrowHead
  lineEnd: TLineEnd
  lineJoin: TLineJoin
  dashPattern: number[]
  fill: Fill
  thickness: number
  radius: number
  borderStyle: TBorderStyle

  constructor (options: TBorderData | null) {
    this.fill = new Fill(options === null || options.fill === undefined ? null : options.fill)
    this.thickness = options === null || options.thickness === undefined ? 0 : options.thickness
    this.endArrowhead = options === null || options.endArrowhead === undefined ? 'None' : options.endArrowhead
    this.startArrowhead = options === null || options.startArrowhead === undefined ? 'None' : options.startArrowhead
    this.lineEnd = options === null || options.lineEnd === undefined ? 'Projecting' : options.lineEnd
    this.lineJoin = options === null || options.lineJoin === undefined ? 'Miter' : options.lineJoin
    this.dashPattern = options === null || options.dashPattern === undefined ? [] : options.dashPattern
    this.borderStyle = dashPatternToBorderStyle(this.dashPattern)
    this.radius = options === null || options.radius === undefined ? 0 : options.radius
    this.style = this.style.bind(this)
  }

  style (): ViewStyle {
    return {
      borderRadius: this.radius,
      borderColor: this.fill.color,
      borderWidth: this.thickness,
      borderStyle: this.borderStyle
    }
  }
}
