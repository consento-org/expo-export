import { applyRenderOptions, IRenderProps, IBaseProps, SketchInLayer } from './SketchInLayer'
import { Slice9Placement } from '../Slice9Placement'
import { View, ViewStyle } from 'react-native'
import { ILayer } from '../types'

export interface ISlice9Props extends IBaseProps<View, ViewStyle> {
  layer: ILayer
  prototype: Slice9Placement
}

export const SketchSlice9 = (props: ISlice9Props): JSX.Element => {
  const { prototype } = props
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const renderProps = {
    ...props,
    place: prototype.place,
    item: ({ ref, style }) => prototype.render(applyRenderOptions(props, prototype.place, style), ref)
  } as IRenderProps<View, ViewStyle>
  return SketchInLayer(renderProps)
}
