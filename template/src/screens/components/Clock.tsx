import React from 'react'
import { ITimeInSeconds } from '../util/useSeconds'
import Svg, { Circle, Line, Linecap, Linejoin } from 'react-native-svg'
import { elementClock } from '../../styles/component/elementClock'
import { TLineEnd, Polygon } from '../../styles/Component'
import { ViewStyle } from 'react-native'

const viewBox = `0 0 ${elementClock.width} ${elementClock.height}`
const radius = elementClock.width / 2
const center = {
  x: elementClock.dial.place.x + radius,
  y: elementClock.dial.place.y + radius
}
const hourLength = elementClock.hour.place.width
const minuteLength = elementClock.minute.place.width

interface IPoint {
  x: number
  y: number
}

/**
 * The line caps of svg don't match with Sketch's linecaps, so we need to convert them.
 */
function lineCap (end: TLineEnd): Linecap {
  if (end === 'Butt') {
    return 'butt'
  }
  if (end === 'Round') {
    return 'round'
  }
  return 'square'
}

const DesignLine = ({ line, start, end }: { line: Polygon, start: IPoint, end: IPoint }): JSX.Element => {
  const join = line.border.lineJoin.toLowerCase() as Linejoin // Svg joins match to the lowercase version of the lineJoins
  const cap = lineCap(line.border.lineEnd)
  return <Line x1={start.x} y1={start.y} x2={end.x} y2={end.y} strokeWidth={line.border.thickness} stroke={line.border.fill.color} strokeLinecap={cap} strokeLinejoin={join} />
}

const pos = (perc: number, start: IPoint, length): IPoint => {
  const rad = (-perc + 0.5) * 2 * Math.PI
  return {
    x: start.x + Math.sin(rad) * length,
    y: start.y + Math.cos(rad) * length
  }
}

export const Clock = ({ width, height, time, style }: { width: number, height: number, time: ITimeInSeconds, style?: ViewStyle }): JSX.Element => {
  const { minutes, hours, seconds } = time
  const secondPerc = seconds / 60
  const minutePerc = (minutes + secondPerc) / 60
  const minuteEnd = pos(minutePerc, center, minuteLength)
  const hourEnd = pos(
    (hours + minutePerc) / 12,
    center,
    hourLength
  )
  return <Svg width={width} height={height} viewBox={viewBox} style={style}>
    <Circle r={radius} cx={center.x} cy={center.y} fill={elementClock.dial.fill.color} />
    <DesignLine line={elementClock.hour} start={center} end={hourEnd} />
    <DesignLine line={elementClock.minute} start={center} end={minuteEnd} />
  </Svg>
}
