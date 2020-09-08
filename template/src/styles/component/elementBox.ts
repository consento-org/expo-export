// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Polygon, Text } from '../Component'
import { Color } from '../Color'
import { TextStyles } from '../TextStyles'

/* eslint-disable lines-between-class-members */
export class ElementBoxClass extends Component {
  bg: Polygon
  labelEn: Text
  labelJa: Text
  constructor () {
    super('elementBox', 115, 111)
    this.bg = new Polygon({ x: 0, y: 0, w: 115, h: 111 }, Color.flatBg, null, [], this)
    this.labelEn = new Text('Item', {
      ...TextStyles.EnBox,
      textAlignVertical: 'center'
    }, { x: 6, y: 41.5, w: 103, h: 28 }, this)
    this.labelJa = new Text('アイテム', TextStyles.JaBox, { x: 0, y: 38.5, w: 115, h: 39 }, this)
  }
}

export const elementBox = new ElementBoxClass()
