import { ViewStyle, View } from 'react-native'
import { Slice9Asset } from './Slice9Asset'
import { IFrameData, Placement } from './Placement'

export class Slice9Placement {
  place: Placement
  asset: () => Slice9Asset

  constructor (asset: () => Slice9Asset, frame: IFrameData) {
    this.asset = asset
    this.place = new Placement(frame)
    this.render = this.render.bind(this)
  }

  render (style?: ViewStyle, ref?: React.Ref<View>, onLayout?: () => any): JSX.Element {
    return this.asset().render(style, ref, onLayout)
  }
}
