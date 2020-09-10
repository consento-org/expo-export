import { Placement, IFrameData } from './Placement'
import { IImageAsset } from './types'

export class ImagePlacement {
  place: Placement
  image: IImageAsset

  constructor (asset: IImageAsset, frame: IFrameData) {
    this.image = asset
    this.place = new Placement(frame)
  }
}
