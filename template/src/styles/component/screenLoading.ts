// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, ImagePlacement } from '../Component'
import { Asset } from '../../Asset'
import { Color } from '../Color'

/* eslint-disable lines-between-class-members */
export class ScreenLoadingClass extends Component {
  splash: ImagePlacement
  constructor () {
    super('screenLoading', 375, 812, Color.white)
    this.splash = new ImagePlacement(Asset.splash, { x: 0, y: 224, w: 375, h: 364 }, this)
  }
}

export const screenLoading = new ScreenLoadingClass()
