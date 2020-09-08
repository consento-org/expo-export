// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, ImagePlacement, Text, Link } from '../Component'
import { Asset } from '../../Asset'
import { TextStyles } from '../TextStyles'
import { elementHeader } from './elementHeader'
import { Color } from '../Color'

/* eslint-disable lines-between-class-members */
export class ScreenSpaceClass extends Component {
  right: ImagePlacement
  left: ImagePlacement
  illustration: ImagePlacement
  titleEn: Text
  titleJa: Text
  header = new Link(elementHeader, { x: -1, y: 0, w: 376, h: 117 }, {})
  constructor () {
    super('screenSpace', 375, 812, Color.green)
    this.right = new ImagePlacement(Asset.iconArrowRight, { x: 248, y: 685, w: 127, h: 127 }, this)
    this.left = new ImagePlacement(Asset.iconArrowLeft, { x: 0, y: 685, w: 127, h: 127 }, this)
    this.illustration = new ImagePlacement(Asset.illustrationSpace, { x: 46.5, y: 218, w: 282, h: 278 }, this)
    this.titleEn = new Text('Space', TextStyles.EnMain, { x: 35.5, y: 456, w: 304, h: 114 }, this)
    this.titleJa = new Text('宇宙', TextStyles.JaMain, { x: 35.5, y: 456, w: 304, h: 114 }, this)
  }
}

export const screenSpace = new ScreenSpaceClass()
