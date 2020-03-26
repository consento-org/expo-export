// This file has been generated with expo-export@3.6.2, a Sketch plugin.
import { Component, Text, Link } from '../Component'
import { TextStyles } from '../TextStyles'
import { componentNavbarBottom } from './componentNavbarBottom'

/* eslint-disable lines-between-class-members */
export class ScreenAClass extends Component {
  title: Text
  navbar = new Link(componentNavbarBottom, { x: 0, y: 690, w: 360, h: 70 }, {
    bLabel: 'Scr. B',
    aLabel: 'Scr. A'
  })
  constructor () {
    super('screenA', 360, 760)
    this.title = new Text('A', TextStyles.Main, { x: 164, y: 352, w: 32, h: 56 }, this)
  }
}

export const screenA = new ScreenAClass()
