import { applyRenderOptions, IBaseProps, SketchInLayer } from './SketchInLayer'
import { View, ViewStyle } from 'react-native'
import { Polygon } from '../Polygon'
import { ILayer } from '../types'

export interface IPolygonProps extends IBaseProps<View, ViewStyle> {
  prototype: Polygon
  layer: ILayer
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
