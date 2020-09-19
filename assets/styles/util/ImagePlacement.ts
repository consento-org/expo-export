import { Placement } from './Placement'
import { IImageAsset, IPlacement } from './types'

export class ImagePlacement {
  place: Placement
  image: IImageAsset

  constructor (asset: IImageAsset, frame: IPlacement) {
    this.image = asset
    this.place = new Placement(frame)
  }
}
