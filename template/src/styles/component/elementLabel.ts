// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Text } from '../Component'
import { TextStyles } from '../TextStyles'

/* eslint-disable lines-between-class-members */
export class ElementLabelClass extends Component {
  labelEn: Text
  labelJa: Text
  constructor () {
    super('elementLabel', 375, 65)
    this.labelEn = new Text('Label', TextStyles.EnLabel, { x: 9.5, y: 17.25, w: 324, h: 30.5 }, this)
    this.labelJa = new Text('ラベル', TextStyles.JaLabel, { x: 9.5, y: 18.25, w: 324, h: 30.5 }, this)
  }
}

export const elementLabel = new ElementLabelClass()
