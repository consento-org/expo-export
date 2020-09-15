import React from 'react'
import { FlexStyle, Insets, GestureResponderEvent, ViewStyle, TouchableOpacity, View, LayoutChangeEvent } from 'react-native'
import { Placement } from '../Placement'
import { useVUnits } from '../useVUnits'
import { exists } from '../lang'
import { RenderGravity } from '../types'

export function applyRenderOptions<T extends FlexStyle> ({ horz, vert }: IRenderOptions, place: Placement, style?: T): T {
  style = (style ?? {}) as T
  style.width = horz === 'stretch' ? '100%' : place.width
  style.height = vert === 'stretch' ? '100%' : place.height
  return style
}

export interface IBaseProps<T extends React.Component, TStyle extends FlexStyle> {
  targetRef?: React.Ref<T>
  vert?: RenderGravity
  horz?: RenderGravity
  style?: TStyle
  debug?: boolean
  hitSlop?: Insets
  onPress?: (event: GestureResponderEvent) => any
  onLayout?: (nativeEvent: LayoutChangeEvent) => any
}

export interface IRenderProps<T extends React.Component, TStyle extends FlexStyle> extends IBaseProps<T, TStyle> {
  place: Placement
  item: (opts: {
    ref?: React.Ref<T>
    style?: TStyle
  }) => JSX.Element
}

export interface IRenderOptions {
  vert?: RenderGravity
  horz?: RenderGravity
  debug?: boolean
  hitSlop?: Insets
  onPress?: (event: GestureResponderEvent) => any
  onLayout?: (nativeEvent: LayoutChangeEvent) => any
}

export function renderItem (item: React.ReactNode, place: Placement, { horz, vert, onPress, onLayout, debug, hitSlop }: IRenderOptions = {}): JSX.Element {
  const { vw, vh } = useVUnits()
  const style: ViewStyle = {
    position: 'absolute'
  }
  const max = { width: vw(100), height: vh(100) }
  place.horz.render(horz ?? 'none', max, style)
  place.vert.render(vert ?? 'none', max, style)
  if (debug ?? false) {
    style.borderColor = '#04a'
    style.backgroundColor = '#ac8888888'
    style.borderWidth = 1
    console.log({ style, horz, vert, place, vw100: vw(100), vh100: vh(100) })
  }
  if (exists(onPress)) {
    return <TouchableOpacity onLayout={onLayout} onPress={onPress} style={style} hitSlop={hitSlop}>{item}</TouchableOpacity>
  }
  return <View onLayout={onLayout} style={style}>{item}</View>
}

export const SketchInLayer = <T extends React.Component, S extends FlexStyle> (props: IRenderProps<T, S>): JSX.Element => {
  return renderItem(props.item({
    ref: props.targetRef,
    style: props.style
  }), props.place, {
    horz: props.horz,
    vert: props.vert,
    debug: props.debug,
    hitSlop: props.hitSlop,
    onPress: props.onPress,
    onLayout: props.onLayout
  })
}
