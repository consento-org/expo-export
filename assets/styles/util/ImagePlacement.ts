import { Image, ImageStyle } from 'react-native'
import { Component, IBaseProps } from './Component'
import { ImageAsset } from './ImageAsset'
import { Placement, IFrameData } from './Placement'

export class ImagePlacement {
  place: Placement
  asset: () => ImageAsset
  parent: Component

  constructor (asset: () => ImageAsset, frame: IFrameData, parent: Component) {
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
