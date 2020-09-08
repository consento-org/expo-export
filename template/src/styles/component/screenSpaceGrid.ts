// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Link } from '../Component'
import { elementBox } from './elementBox'
import { elementHeader } from './elementHeader'
import { elementBottomBar } from './elementBottomBar'
import { Color } from '../Color'

/* eslint-disable lines-between-class-members */
export class ScreenSpaceGridClass extends Component {
  box1 = new Link(elementBox, { x: 9, y: 138, w: 115, h: 111 }, {})
  box2 = new Link(elementBox, { x: 130.5, y: 138, w: 115, h: 111 }, {})
  box3 = new Link(elementBox, { x: 252, y: 138, w: 115, h: 111 }, {})
  box4 = new Link(elementBox, { x: 9, y: 256, w: 115, h: 111 }, {})
  box5 = new Link(elementBox, { x: 130.5, y: 256, w: 115, h: 111 }, {})
  box6 = new Link(elementBox, { x: 252, y: 256, w: 115, h: 111 }, {})
  header = new Link(elementHeader, { x: 0, y: 0.5, w: 376, h: 117 }, {})
  bottomBar = new Link(elementBottomBar, { x: 0, y: 732, w: 375, h: 80 }, {})
  constructor () {
    super('screenSpaceGrid', 375, 812, Color.bg)
  }
}

export const screenSpaceGrid = new ScreenSpaceGridClass()
