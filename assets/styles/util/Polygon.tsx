import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { View, ViewStyle } from 'react-native'
import { isSketchError, exists } from './lang'
import { Placement, IFrameData } from './Placement'
import { Fill, TFillData } from './Fill'
import { Border, TBorderData } from './Border'
import { Shadow, TShadowData } from './Shadow'

export class Polygon {
  place: Placement
  fill: Fill
  borderRadius: number
  border: Border
  shadows: Shadow[]

  constructor (frame: IFrameData, fill: TFillData | null, border: TBorderData | null, shadows: TShadowData[]) {
    this.place = new Placement(frame)
    this.fill = new Fill(fill)
    this.border = new Border(border)
    this.borderRadius = this.border.radius
    this.shadows = shadows.map(data => new Shadow(data))
    this.RenderRect = this.RenderRect.bind(this)
    this.borderStyle = this.borderStyle.bind(this)
  }

  RenderRect ({ style, ref, onLayout }: { style?: ViewStyle, ref?: React.Ref<any>, onLayout?: () => any } = {}): JSX.Element {
    const data = this.fill.data
    if (!exists(data)) {
      return <View style={{
        ...style,
        ...this.borderStyle()
      }} />
    }
    if (typeof data === 'string') {
      return <View style={{
        ...style,
        ...this.borderStyle(),
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
        ...this.borderStyle(),
        ...style
      }}
    />
  }

  borderStyle (): ViewStyle {
    return this.border.style()
  }
}
