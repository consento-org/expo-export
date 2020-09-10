import React from 'react'
import { View, ViewStyle, Image, ImageStyle } from 'react-native'
import { applyRenderOptions, IRenderProps, SketchInLayer } from './SketchInLayer'
import { ISlice9 } from '../types'
import { Slice9Placement } from '../Slice9Placement'
import { Placement } from '../Placement'

export interface ISlice9Props extends IRenderProps<View, ViewStyle> {
  prototype: Slice9Placement | ISlice9
}

const rowsStyle: ViewStyle = {
  display: 'flex',
  flexDirection: 'row'
}

export const SketchSlice9 = (props: ISlice9Props): JSX.Element => {
  const slice9Input = props.prototype
  const slice9 = slice9Input instanceof Slice9Placement ? slice9Input.slice9 : slice9Input
  const place = slice9Input instanceof Slice9Placement ? slice9Input.place : new Placement({ x: 0, y: 0, w: slice9Input.width, h: slice9Input.height })
  const { slice } = slice9
  const slices = slice9.slices()
  const right = slice9.width - slice.right
  const bottom = slice9.height - slice.bottom
  const rows = [{
    ...rowsStyle,
    height: slice.y
  }, {
    ...rowsStyle,
    flexGrow: 1,
    marginTop: -0.05 // Fixing accidental appearing empty lines
  }, {
    ...rowsStyle,
    height: bottom
  }]
  const styles = [
    { width: slice.x, height: '100%' },
    { flexGrow: 1, height: '100%' },
    { width: right, height: '100%' },
    { width: slice.x, height: '100%' },
    { flexGrow: 1, height: '100%' },
    { width: right, height: '100%' },
    { width: slice.x, height: bottom },
    { flexGrow: 1, height: bottom },
    { width: right, height: bottom }
  ].map((style: ImageStyle) => {
    // Causes images to flicker on first render
    // It looks weird if only the streched images flicker.
    style.resizeMode = 'stretch'
    return style
  })
  if (slices.length !== 9) {
    throw new Error('For a slice-9 we need 9 resources!')
  }
  return SketchInLayer({
    ...props,
    place,
    item: ({ ref, style }: { ref?: React.Ref<View>, style?: ViewStyle }) => {
      return <View
        style={applyRenderOptions(props, place, {
          display: 'flex',
          flexDirection: 'column',
          width: place.width,
          height: place.height,
          ...style
        })}
        ref={ref}>
        <View style={rows[0]}>
          <Image source={slices[0]} style={styles[0]} fadeDuration={0} />
          <Image source={slices[1]} style={styles[1]} fadeDuration={0} />
          <Image source={slices[2]} style={styles[2]} fadeDuration={0} />
        </View>
        <View style={rows[1]}>
          <Image source={slices[3]} style={styles[3]} fadeDuration={0} />
          <Image source={slices[4]} style={styles[4]} fadeDuration={0} />
          <Image source={slices[5]} style={styles[5]} fadeDuration={0} />
        </View>
        <View style={rows[2]}>
          <Image source={slices[6]} style={styles[6]} fadeDuration={0} />
          <Image source={slices[7]} style={styles[7]} fadeDuration={0} />
          <Image source={slices[8]} style={styles[8]} fadeDuration={0} />
        </View>
      </View>
    }
  })
}
