// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, ImagePlacement, Text, Link } from '../Component'
import { Asset } from '../../Asset'
import { TextStyles } from '../TextStyles'
import { elementHeader } from './elementHeader'
import { Color } from '../Color'

/* eslint-disable lines-between-class-members */
export class ScreenMindClass extends Component {
  right: ImagePlacement
  left: ImagePlacement
  illustration: ImagePlacement
  titleEn: Text
  titleJa: Text
  header = new Link(elementHeader, { x: -1, y: 0, w: 376, h: 117 }, {})
  constructor () {
    super('screenMind', 375, 812, Color.blue)
    this.right = new ImagePlacement(Asset.iconArrowRight, { x: 248, y: 685, w: 127, h: 127 }, this)
    this.left = new ImagePlacement(Asset.iconArrowLeft, { x: 0, y: 685, w: 127, h: 127 }, this)
    this.illustration = new ImagePlacement(Asset.illustrationMind, { x: 45, y: 218, w: 244, h: 278 }, this)
    this.titleEn = new Text('Mind', TextStyles.EnMain, { x: 35.5, y: 456, w: 304, h: 114 }, this)
    this.titleJa = new Text('心情', TextStyles.JaMain, { x: 44.5, y: 456, w: 295, h: 114 }, this)
  }
}

export const screenMind = new ScreenMindClass()
