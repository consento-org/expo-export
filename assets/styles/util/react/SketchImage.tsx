import React from 'react'
import { SketchInLayer, applyRenderOptions, IBaseProps } from './SketchInLayer'
import { Image, ImageStyle } from 'react-native'
import { ImagePlacement } from '../ImagePlacement'
import { IImageAsset } from '../types'
import { exists } from '../lang'
import { Placement } from '../Placement'

export interface IImageProps extends IBaseProps<Image, ImageStyle> {
  prototype: ImagePlacement | IImageAsset
  fadeDuration?: number
}

export const SketchImage = (props: IImageProps): JSX.Element => {
  const image = props.prototype instanceof ImagePlacement ? props.prototype.image : props.prototype
  const place = props.prototype instanceof ImagePlacement ? props.prototype.place : new Placement({ x: 0, y: 0, w: props.prototype.width, h: props.prototype.height, r: 0, b: 0 })
  let { fadeDuration } = props

  return SketchInLayer({
    ...props,
    place,
    item: ({ ref, style }: { ref?: React.Ref<Image>, style?: ImageStyle }) => {
      if (!exists(fadeDuration) && exists(style) && style.resizeMode === 'stretch') {
        // Fixing bugs when stretching items
        fadeDuration = 0
      }
      return <Image
        source={image.source()}
        style={applyRenderOptions(props, place, style)}
        fadeDuration={fadeDuration}
        ref={ref}
      />
    }
  })
}
