import { Image, ImageStyle } from 'react-native'
import { ImageAsset } from './ImageAsset'
import { Placement, IFrameData } from './Placement'

export class ImagePlacement {
  place: Placement
  asset: () => ImageAsset

  constructor (asset: () => ImageAsset, frame: IFrameData) {
    this.asset = asset
    this.place = new Placement(frame)
    this.img = this.img.bind(this)
  }

  img (style?: ImageStyle, ref?: React.Ref<Image>, onLayout?: () => any): JSX.Element {
    return this.asset().img(style, ref, onLayout)
  }
}
