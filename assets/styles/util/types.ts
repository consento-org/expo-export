import { ImageSourcePropType } from 'react-native'
import { Placement } from './Placement'

export interface ISize {
  width: number
  height: number
}

export interface ILayer<TLayers = any> extends ISize {
  name: string
  backgroundColor?: string | undefined
  layers?: TLayers
}

export interface IImageAsset extends ILayer {
  source: () => ImageSourcePropType
}

export interface ISlice9 extends ILayer {
  slice: Placement
  slices: () => [
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType,
    ImageSourcePropType
  ]
}
