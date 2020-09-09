import { applyRenderOptions, IRenderProps, IBaseProps, SketchInLayer } from './SketchInLayer'
import { View, ViewStyle } from 'react-native'
import { Polygon } from '../Polygon'
import { Layer } from '../Layer'

export interface IPolygonProps extends IBaseProps<View, ViewStyle> {
  prototype: Polygon
  layer: Layer
}

export const SketchPolygon = (props: IPolygonProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const renderProps = {
    ...props,
    place: props.prototype.place,
    item: ({ ref, style }) => props.prototype.RenderRect({
      style: applyRenderOptions(props, props.prototype.place, style),
      ref
    })
  } as IRenderProps<View, ViewStyle>
  return SketchInLayer(renderProps)
}
