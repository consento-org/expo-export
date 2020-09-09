import { SketchInLayer, IBaseProps, applyRenderOptions, IRenderProps } from './SketchInLayer'
import { Image, ImageStyle } from 'react-native'
import { ImagePlacement } from '../ImagePlacement'
import { Layer } from '../Layer'

export interface IImageProps extends IBaseProps<Image, ImageStyle> {
  layer: Layer
  prototype: ImagePlacement
}

export const SketchImage = (props: IImageProps): JSX.Element => {
  const { prototype } = props
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const renderProps = {
    ...props,
    place: prototype.place,
    item: ({ ref, style }) => prototype.img(applyRenderOptions(props, prototype.place, style), ref)
  } as IRenderProps<Image, ImageStyle>
  return SketchInLayer(renderProps)
}
