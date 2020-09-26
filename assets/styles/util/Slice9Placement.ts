import { Placement } from './Placement'
import { ISlice9, IPlacement } from './types'

export class Slice9Placement {
  name: string
  place: Placement
  slice9: ISlice9

  constructor (name: string, slice9: ISlice9, frame: IPlacement) {
    this.name = name
    this.slice9 = slice9
    this.place = new Placement(frame)
  }
}
