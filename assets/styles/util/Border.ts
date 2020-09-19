import { Fill } from './Fill'
import { ArrowHead, Linecap, Linejoin, BorderStyle, FillData } from './types'

export interface TBorderData {
  fill?: FillData
  thickness?: number
  endArrowhead?: ArrowHead
  startArrowhead?: ArrowHead
  strokeLinecap?: Linecap
  strokeLinejoin?: Linejoin
  dashPattern?: number[]
  radius?: number
}

function dashPatternToBorderStyle (dashPattern: number[]): BorderStyle {
  if (dashPattern.length === 1) {
    return 'dotted'
  }
  if (dashPattern.length === 2) {
    return 'dashed'
  }
  return 'solid'
}

export class Border {
  endArrowhead: ArrowHead
  startArrowhead: ArrowHead
  strokeLinecap: Linecap
  strokeLinejoin: Linejoin
  dashPattern: number[]
  fill: Fill
  thickness: number
  radius: number
  borderStyle: BorderStyle

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
  }
}
