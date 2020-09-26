import { Placement } from './Placement'
import { IImageAsset, IPlacement } from './types'

export class ImagePlacement {
  name: string
  place: Placement
  image: IImageAsset

  constructor (name: string, asset: IImageAsset, frame: IPlacement) {
    this.name = name
    this.image = asset
    this.place = new Placement(frame)
  }
}
