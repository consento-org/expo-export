import { View, ViewStyle } from 'react-native'
import { applyRenderOptions, IBaseProps, SketchInLayer } from './SketchInLayer'
import { Polygon } from '../Polygon'

export interface IPolygonProps extends IBaseProps<View, ViewStyle> {
  prototype: Polygon
}

export const SketchPolygon = (props: IPolygonProps): JSX.Element => {
  return SketchInLayer({
    ...props,
    place: props.prototype.place,
    item: ({ ref, style }) => props.prototype.RenderRect({
      style: applyRenderOptions(props, props.prototype.place, style),
      ref
    })
  })
}
