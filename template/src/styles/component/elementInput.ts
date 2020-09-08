// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Polygon, Text } from '../Component'
import { Color } from '../Color'
import { TextStyles } from '../TextStyles'

/* eslint-disable lines-between-class-members */
export class ElementInputClass extends Component {
  bg: Polygon
  bright: Polygon
  inputEn: Text
  inputJa: Text
  constructor () {
    super('elementInput', 375, 62)
    this.bg = new Polygon({ x: 0, y: 0, w: 375, h: 62 }, Color.flatBg, null, [], this)
    this.bright = new Polygon({ x: 9.75, y: 0, w: 355.5, h: 62 }, Color.white, null, [], this)
    this.inputEn = new Text('Input here', TextStyles.EnInput, { x: 10, y: 9, w: 355, h: 53 }, this)
    this.inputJa = new Text('入力して下さい', TextStyles.JaInput, { x: 10.25, y: 4, w: 355, h: 53 }, this)
  }
}

export const elementInput = new ElementInputClass()
