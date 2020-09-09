import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { View, ViewStyle } from 'react-native'
import { isSketchError } from './lang'
import { Layer, IBaseProps } from './Layer'
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
  parent: Layer

  constructor (frame: IFrameData, fill: TFillData | null, border: TBorderData | null, shadows: TShadowData[], parent: Layer) {
    this.place = new Placement(frame)
    this.fill = new Fill(fill)
    this.border = new Border(border)
    this.borderRadius = this.border.radius
    this.shadows = shadows.map(data => new Shadow(data))
    this.parent = parent
    this.Render = this.Render.bind(this)
    this.RenderRect = this.RenderRect.bind(this)
    this.borderStyle = this.borderStyle.bind(this)
  }

  Render (props: IBaseProps<View, ViewStyle>): JSX.Element {
    return this.parent.Polygon({
      ...props,
      prototype: this
    })
  }

  RenderRect ({ style, ref, onLayout }: { style?: ViewStyle, ref?: React.Ref<any>, onLayout?: () => any } = {}): JSX.Element {
    const data = this.fill.data
    if (data === null) {
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
