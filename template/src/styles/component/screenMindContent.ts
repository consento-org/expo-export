// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import { Component, Link } from '../Component'
import { elementInput } from './elementInput'
import { elementLabel } from './elementLabel'
import { elementButton } from './elementButton'
import { elementHeader } from './elementHeader'
import { Color } from '../Color'

/* eslint-disable lines-between-class-members */
export class ScreenMindContentClass extends Component {
  input = new Link(elementInput, { x: 0, y: 205, w: 375, h: 62 }, {})
  label = new Link(elementLabel, { x: 0, y: 140, w: 375, h: 65 }, {})
  ok = new Link(elementButton, { x: 10, y: 286.64, w: 170, h: 80 }, {})
  header = new Link(elementHeader, { x: 0, y: 0.85, w: 376, h: 117 }, {})
  constructor () {
    super('screenMindContent', 375, 812, Color.bg)
  }
}

export const screenMindContent = new ScreenMindContentClass()
