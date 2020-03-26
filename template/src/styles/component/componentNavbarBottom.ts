// This file has been generated with expo-export@3.6.2, a Sketch plugin.
import { Component, Polygon, Link } from '../Component'
import { Color } from '../Color'
import { componentNavbarButton } from './componentNavbarButton'

/* eslint-disable lines-between-class-members */
export class ComponentNavbarBottomClass extends Component {
  active: Polygon
  a = new Link(componentNavbarButton, { x: 110, y: 0, w: 70, h: 70 }, {
    label: 'Scr. A'
  })
  b = new Link(componentNavbarButton, { x: 180, y: 0, w: 70, h: 70 }, {
    label: 'Scr. B'
  })
  constructor () {
    super('componentNavbarBottom', 360, 70, Color.navBg)
    this.active = new Polygon({ x: 110, y: 0, w: 70, h: 70 }, Color.navSelected, null, [], this)
  }
}

export const componentNavbarBottom = new ComponentNavbarBottomClass()
