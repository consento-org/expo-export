// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Polygon, Text } from '../Component'
import { Color } from '../Color'
import { TextStyles } from '../TextStyles'

/* eslint-disable lines-between-class-members */
export class ElementItemClass extends Component {
  bg: Polygon
  labelEn: Text
  labelJa: Text
  constructor () {
    super('elementItem', 375, 73)
    this.bg = new Polygon({ x: 0, y: 6, w: 375, h: 67 }, Color.flatBg, null, [], this)
    this.labelEn = new Text('Item', TextStyles.EnItem, { x: 10, y: 6, w: 355, h: 67 }, this)
    this.labelJa = new Text('アイテム', TextStyles.JaItem, { x: 10, y: 8.5, w: 355, h: 56 }, this)
  }
}

export const elementItem = new ElementItemClass()
