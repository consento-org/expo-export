import { Placement } from './Placement'
import { ISlice9, IPlacement } from './types'

export class Slice9Placement {
  place: Placement
  slice9: ISlice9

  constructor (slice9: ISlice9, frame: IPlacement) {
    this.slice9 = slice9
    this.place = new Placement(frame)
  }
}
