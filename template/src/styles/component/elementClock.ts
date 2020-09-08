// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Polygon } from '../Component'
import { Color } from '../Color'

/* eslint-disable lines-between-class-members */
export class ElementClockClass extends Component {
  dial: Polygon
  minute: Polygon
  hour: Polygon
  constructor () {
    super('elementClock', 240, 239, Color.bg)
    this.dial = new Polygon({ x: 0, y: 0, w: 238.87, h: 238.87 }, Color.white, null, [], this)
    this.minute = new Polygon({ x: 118.5, y: 119, w: 121, h: 1 }, null, {
      fill: '#000000ff',
      thickness: 2,
      lineEnd: 'Round'
    }, [], this)
    this.hour = new Polygon({ x: 118.93, y: 118.93, w: 64, h: 1 }, null, {
      fill: '#000000ff',
      thickness: 6,
      lineEnd: 'Round'
    }, [], this)
  }
}

export const elementClock = new ElementClockClass()
