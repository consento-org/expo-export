import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { View, ViewStyle } from 'react-native'
import { isSketchError, exists } from './lang'
import { Placement } from './Placement'
import { IPlacement, FillData, IShadow, IBorder } from './types'
import { Fill } from './Fill'
import { Border, TBorderData } from './Border'
import { Shadow } from './Shadow'

function borderStyle (border: IBorder): Pick<ViewStyle, 'borderRadius' | 'borderColor' | 'borderWidth' | 'borderStyle'> {
  return {
    borderRadius: border.radius,
    borderColor: border.fill.color,
    borderWidth: border.thickness,
    borderStyle: border.borderStyle
  }
}

export class Polygon {
  place: Placement
  fill: Fill
  borderRadius: number
  border: Border
  shadows: Shadow[]

  constructor (frame: IPlacement, fill: FillData | null, border: TBorderData | null, shadows: IShadow[]) {
    this.place = new Placement(frame)
    this.fill = new Fill(fill)
    this.border = new Border(border)
    this.borderRadius = this.border.radius
    this.shadows = shadows.map(data => new Shadow(data))
    this.RenderRect = this.RenderRect.bind(this)
  }

  RenderRect ({ style, ref, onLayout }: { style?: ViewStyle, ref?: React.Ref<any>, onLayout?: () => any } = {}): JSX.Element {
    const data = this.fill.data
    if (!exists(data)) {
      return <View style={{
        ...style,
        ...borderStyle(this.border)
      }} />
    }
    if (typeof data === 'string') {
      return <View style={{
        ...style,
        ...borderStyle(this.border),
        backgroundColor: data
      }} />
    }
    if (isSketchError(data)) {
      throw new Error(data.error)
    }
    return <LinearGradient
      colors={data.gradient.stops.map(stop => stop.color)}
      locations={data.gradient.stops.map(stop => stop.position)}
      start={[data.gradient.from.x, data.gradient.from.y]}
      end={[data.gradient.to.x, data.gradient.to.y]}
      ref={ref}
      onLayout={onLayout}
      style={{
        ...borderStyle(this.border),
        ...style
      }}
    />
  }
}
