import { Placement, IFrameData } from './Placement'

export class Link <T, Texts> {
  place: Placement
  component: T
  text: Texts

  constructor (component: T, frame: IFrameData, text: Texts) {
    this.component = component
    this.place = new Placement(frame)
    this.text = text
  }
}
