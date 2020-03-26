// This file has been generated with expo-export@3.6.2, a Sketch plugin.
import { Component, ImagePlacement } from '../Component'
import { Asset } from '../../Asset'

/* eslint-disable lines-between-class-members */
export class ScreenLoadingClass extends Component {
  splash: ImagePlacement
  constructor () {
    super('screenLoading', 360, 760)
    this.splash = new ImagePlacement(Asset.splash, { x: 22, y: 369.5, w: 192, h: 192 }, this)
  }
}

export const screenLoading = new ScreenLoadingClass()
