import { Placement } from './Placement'
import { ISlice9, IPlacement, ISlices } from './types'

function project (slice: Placement, from: Placement, to: Placement): Placement {
  const horz = 1 / from.width * to.width
  const vert = 1 / from.height * to.height
  return new Placement({ x: slice.x * horz, y: slice.y * vert, w: slice.w * horz, h: slice.h * vert, r: slice.r * horz, b: slice.b * vert })
}

export class Slice9Placement implements ISlice9 {
  name: string
  place: Placement
  slice: Placement
  slice9: ISlice9

  constructor (name: string, slice9: ISlice9, frame: IPlacement) {
    this.name = name
    this.slice9 = slice9
    this.place = new Placement(frame)
    this.slice = project(slice9.slice, slice9.place, this.place)
  }

  slices (): ISlices {
    return this.slice9.slices()
  }
}
