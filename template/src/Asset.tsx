// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import React from 'react'
import { Image, ImageStyle, View, ViewStyle, ImageSourcePropType, TouchableOpacity, FlexStyle, GestureResponderEvent } from 'react-native'

function exists <T> (value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

class Cache<Type, Args> {
  cache: { [key: string]: Type } = {}
  clazz: new (Args) => Type

  constructor (clazz: new (Args: Args) => Type) {
    this.clazz = clazz
  }

  fetch (key: string, load: () => Args): Type {
    let result = this.cache[key]
    if (result === undefined) {
      // eslint-disable-next-line new-cap
      result = new this.clazz(load())
      this.cache[key] = result
    }
    return result
  }
}

export class ImageAsset {
  source: ImageSourcePropType
  component: (props: { style?: FlexStyle, onPress?: (event: GestureResponderEvent) => void }) => JSX.Element

  constructor (source: ImageSourcePropType) {
    this.source = source
    this.component = ({ style, onPress }) => {
      if (onPress !== undefined) {
        return <TouchableOpacity onPress={onPress} style={style}>{this.img()}</TouchableOpacity>
      }
      return this.img(style)
    }
  }

  img (style?: FlexStyle, ref?: React.Ref<Image>, onLayout?: () => any): JSX.Element {
    const imgStyle = style as ImageStyle
    if (exists(imgStyle) && imgStyle.resizeMode === 'stretch') {
      return <Image ref={ref} onLayout={onLayout} source={this.source} style={imgStyle} fadeDuration={0} />
    }
    return <Image ref={ref} onLayout={onLayout} source={this.source} style={imgStyle} />
  }
}

export interface Slice9Args {
  w: number
  h: number
  slice: {
    x: number
    y: number
    w: number
    h: number
  }
  slices: ImageSourcePropType[]
}

const rowsStyle: ViewStyle = {
  display: 'flex',
  flexDirection: 'row'
}

export class Slice9 {
  width: number
  height: number
  _rows: ViewStyle[]
  _columsStyle: ViewStyle
  _styles: ImageStyle[]
  _slices: ImageSourcePropType[]

  constructor ({ w, h, slice, slices }: Slice9Args) {
    this.width = w
    this.height = h
    const x = (slice.x + 0.5) | 0
    const y = (slice.y + 0.5) | 0
    const right = (w - x - slice.w + 0.5) | 0
    const bottom = (h - y - slice.h + 0.5) | 0
    this._columsStyle = {
      display: 'flex',
      width: w,
      height: h,
      flexDirection: 'column'
    }
    this._rows = [{
      ...rowsStyle,
      height: y
    }, {
      ...rowsStyle,
      flexGrow: 1,
      marginTop: -0.05 // Fixing accidental appearing empty lines
    }, {
      ...rowsStyle,
      height: bottom
    }]
    this._styles = [
      { width: x, height: '100%' },
      { flexGrow: 1, height: '100%' },
      { width: right, height: '100%' },
      { width: x, height: '100%' },
      { flexGrow: 1, height: '100%' },
      { width: right, height: '100%' },
      { width: x, height: bottom },
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
    this._slices = slices
  }

  render (style?: ViewStyle, ref?: React.Ref<View>, onLayout?: () => any): JSX.Element {
    if (style === null || style === undefined) {
      style = this._columsStyle
    } else {
      style = {
        ...this._columsStyle,
        ...style
      }
    }
    return <View style={style} ref={ref} onLayout={onLayout}>
      <View style={this._rows[0]}>
        <Image source={this._slices[0]} style={this._styles[0]} fadeDuration={0} />
        <Image source={this._slices[1]} style={this._styles[1]} fadeDuration={0} />
        <Image source={this._slices[2]} style={this._styles[2]} fadeDuration={0} />
      </View>
      <View style={this._rows[1]}>
        <Image source={this._slices[3]} style={this._styles[3]} fadeDuration={0} />
        <Image source={this._slices[4]} style={this._styles[4]} fadeDuration={0} />
        <Image source={this._slices[5]} style={this._styles[5]} fadeDuration={0} />
      </View>
      <View style={this._rows[2]}>
        <Image source={this._slices[6]} style={this._styles[6]} fadeDuration={0} />
        <Image source={this._slices[7]} style={this._styles[7]} fadeDuration={0} />
        <Image source={this._slices[8]} style={this._styles[8]} fadeDuration={0} />
      </View>
    </View>
  }
}

const images = new Cache<ImageAsset, ImageSourcePropType>(ImageAsset)

export const Asset = {
  icon () {
    return images.fetch('icon', () => require('../assets/icon.png'))
  },
  iconArrowBack () {
    return images.fetch('iconArrowBack', () => require('../assets/icon/arrow/back.png'))
  },
  iconArrowLeft () {
    return images.fetch('iconArrowLeft', () => require('../assets/icon/arrow/left.png'))
  },
  iconArrowRight () {
    return images.fetch('iconArrowRight', () => require('../assets/icon/arrow/right.png'))
  },
  iconBottomGrid () {
    return images.fetch('iconBottomGrid', () => require('../assets/icon/bottom/grid.png'))
  },
  iconBottomList () {
    return images.fetch('iconBottomList', () => require('../assets/icon/bottom/list.png'))
  },
  iconBottomLongText () {
    return images.fetch('iconBottomLongText', () => require('../assets/icon/bottom/long-text.png'))
  },
  illustrationMind () {
    return images.fetch('illustrationMind', () => require('../assets/illustration/mind.png'))
  },
  illustrationSpace () {
    return images.fetch('illustrationSpace', () => require('../assets/illustration/space.png'))
  },
  illustrationTime () {
    return images.fetch('illustrationTime', () => require('../assets/illustration/time.png'))
  },
  logo () {
    return images.fetch('logo', () => require('../assets/logo.png'))
  },
  splash () {
    return images.fetch('splash', () => require('../assets/splash.png'))
  }
}
