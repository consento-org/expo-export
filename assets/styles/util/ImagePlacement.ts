import { Image, ImageStyle } from 'react-native'
import { Layer, IBaseProps } from './Layer'
import { ImageAsset } from './ImageAsset'
import { Placement, IFrameData } from './Placement'

export class ImagePlacement <TParent extends Layer = Layer> {
  place: Placement
  asset: () => ImageAsset
  parent: TParent

  constructor (asset: () => ImageAsset, frame: IFrameData, parent: TParent) {
    this.asset = asset
    this.place = new Placement(frame)
    this.parent = parent
    this.Render = this.Render.bind(this)
    this.img = this.img.bind(this)
  }

  Render (props: IBaseProps<Image, ImageStyle>): JSX.Element {
    return this.parent.Image({
      ...props,
      prototype: this
    })
  }

  img (style?: ImageStyle, ref?: React.Ref<Image>, onLayout?: () => any): JSX.Element {
    return this.asset().img(style, ref, onLayout)
  }
}
