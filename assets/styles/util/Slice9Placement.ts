import { ViewStyle, View } from 'react-native'
import { Component } from './Component'
import { Slice9Asset } from './Slice9Asset'
import { IFrameData, Placement } from './Placement'

export class Slice9Placement {
  place: Placement
  asset: () => Slice9Asset
  parent: Component

  constructor (asset: () => Slice9Asset, frame: IFrameData, parent: Component) {
    this.asset = asset
    this.place = new Placement(frame)
    this.parent = parent
    this.render = this.render.bind(this)
  }

  render (style?: ViewStyle, ref?: React.Ref<View>, onLayout?: () => any): JSX.Element {
    return this.asset().render(style, ref, onLayout)
  }
}
