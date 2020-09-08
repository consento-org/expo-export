// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, ImagePlacement, Polygon } from '../Component'
import { Asset } from '../../Asset'
import { Color } from '../Color'

/* eslint-disable lines-between-class-members */
export class ElementHeaderClass extends Component {
  logo: ImagePlacement
  topBar: Polygon
  back: ImagePlacement
  line: Polygon
  constructor () {
    super('elementHeader', 376, 117)
    this.logo = new ImagePlacement(Asset.logo, { x: 161.5, y: 49, w: 54, h: 53 }, this)
    this.topBar = new Polygon({ x: 1, y: 0, w: 375, h: 33 }, Color.dark, null, [], this)
    this.back = new ImagePlacement(Asset.iconArrowBack, { x: 14, y: 47.5, w: 73, h: 56 }, this)
    this.line = new Polygon({ x: 0.5, y: 116, w: 376, h: 1 }, null, {
      fill: Color.white,
      thickness: 4
    }, [], this)
  }
}

export const elementHeader = new ElementHeaderClass()
