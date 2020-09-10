import { Placement, IFrameData } from './Placement'
import { ISlice9 } from './types'

export class Slice9Placement {
  place: Placement
  slice9: ISlice9

  constructor (slice9: ISlice9, frame: IFrameData) {
    this.slice9 = slice9
    this.place = new Placement(frame)
  }
}
