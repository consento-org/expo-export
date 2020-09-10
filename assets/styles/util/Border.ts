import { ViewStyle } from 'react-native'
import { Fill, TFillData } from './Fill'

export type TArrowHead = 'None' | 'OpenArrow' | 'FilledArrow' | 'Line' | 'OpenCircle' | 'FilledCircle' | 'OpenSquare' | 'FilledSquare'
export type TLinecap = 'butt' | 'square' | 'round'
export type TLinejoin = 'miter' | 'bevel' | 'round'
export type TBorderStyle = 'dotted' | 'dashed' | 'solid'

export interface TBorderData {
  fill?: TFillData
  thickness?: number
  endArrowhead?: TArrowHead
  startArrowhead?: TArrowHead
  strokeLinecap?: TLinecap
  strokeLinejoin?: TLinejoin
  dashPattern?: number[]
  radius?: number
}

function dashPatternToBorderStyle (dashPattern: number[]): TBorderStyle {
  if (dashPattern.length === 1) {
    return 'dotted'
  }
  if (dashPattern.length === 2) {
    return 'dashed'
  }
  return 'solid'
}

export class Border {
  endArrowhead: TArrowHead
  startArrowhead: TArrowHead
  strokeLinecap: TLinecap
  strokeLinejoin: TLinejoin
  dashPattern: number[]
  fill: Fill
  thickness: number
  radius: number
  borderStyle: TBorderStyle

  constructor (options: TBorderData | null) {
    this.fill = new Fill(options?.fill ?? null)
    this.thickness = options?.thickness ?? 0
    this.endArrowhead = options?.endArrowhead ?? 'None'
    this.startArrowhead = options?.startArrowhead ?? 'None'
    this.strokeLinecap = options?.strokeLinecap ?? 'square'
    this.strokeLinejoin = options?.strokeLinejoin ?? 'miter'
    this.dashPattern = options?.dashPattern ?? []
    this.radius = options?.radius ?? 0
    this.borderStyle = dashPatternToBorderStyle(this.dashPattern)
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
