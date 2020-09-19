import { Placement } from './Placement'
import { ILayer, IPlacement } from './types'

type FType<Input, Type> = (input: Input) => Type

function isFn <Input, Type> (input: Type | FType<Input, Type>): input is FType<Input, Type> {
  return typeof input === 'function'
}

export class LayerPlacement <TLayer extends ILayer<TLayers>, TLayers, TOverrides extends Object = {}> {
  place: Placement
  layer: TLayer
  layers: Omit<TLayers, keyof TOverrides> & TOverrides

  constructor (layer: TLayer, layers: TLayers, frame: IPlacement, overrides?: TOverrides | FType<TLayers, TOverrides>) {
    this.layer = layer
    this.place = new Placement(frame)
    this.layers = {
      ...layers,
      ...isFn(overrides) ? overrides(layers) : overrides
    } as any
  }
}
