// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Polygon, ImagePlacement } from '../Component'
import { Color } from '../Color'
import { Asset } from '../../Asset'

/* eslint-disable lines-between-class-members */
export class ElementBottomBarClass extends Component {
  active: Polygon
  longText: ImagePlacement
  grid: ImagePlacement
  list: ImagePlacement
  line: Polygon
  constructor () {
    super('elementBottomBar', 375, 80, Color.dark)
    this.active = new Polygon({ x: 0, y: 1, w: 139, h: 79 }, Color.middle, null, [], this)
    this.longText = new ImagePlacement(Asset.iconBottomList, { x: 55.5, y: 27, w: 32, h: 32 }, this)
    this.grid = new ImagePlacement(Asset.iconBottomLongText, { x: 171.79, y: 27, w: 32, h: 32 }, this)
    this.list = new ImagePlacement(Asset.iconBottomGrid, { x: 291, y: 27, w: 32, h: 32 }, this)
    this.line = new Polygon({ x: 0, y: 0, w: 376, h: 1 }, null, {
      fill: Color.white,
      thickness: 4
    }, [], this)
  }
}

export const elementBottomBar = new ElementBottomBarClass()
