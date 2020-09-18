import { Placement } from './Placement'
import { IPlacement, FillData, IShadow } from './types'
import { Fill } from './Fill'
import { Border, TBorderData } from './Border'
import { Shadow } from './Shadow'

export class Polygon {
  place: Placement
  fill: Fill
  borderRadius: number
  border: Border
  shadows: Shadow[]

  constructor (place: IPlacement, fill: FillData | null, border: TBorderData | null, shadows: IShadow[]) {
    this.place = new Placement(place)
    this.fill = new Fill(fill)
    this.border = new Border(border)
    this.borderRadius = this.border.radius
    this.shadows = shadows.map(data => new Shadow(data))
  }
}
