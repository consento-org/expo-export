import { Placement } from './Placement'
import { ILayer, IPlacement } from './types'

export class LayerPlacement <TTexts, TLayer extends ILayer = ILayer> {
  place: Placement
  layer: TLayer
  text: TTexts

  constructor (layer: TLayer, frame: IPlacement, text: TTexts) {
    this.layer = layer
    this.place = new Placement(frame)
    this.text = text
  }
}
