import React from 'react'
import { Image, ImageStyle, View, ViewStyle, ImageSourcePropType, TouchableOpacity, FlexStyle } from 'react-native'

class Cache<Type, Args> {
  cache: { [key: string]: Type } = {}
  clazz: { new (Args): Type }

  constructor (clazz: { new (Args: Args): Type }) {
    this.clazz = clazz
  }

  fetch (key: string, load: () => Args): Type {
    let result = this.cache[key]
    if (result === undefined) {
      result = new this.clazz(load())
      this.cache[key] = result
    }
    return result
  }
}

export class ImageAsset {
  source: ImageSourcePropType
  component: (props: { style?: FlexStyle, onPress?: () => void }) => JSX.Element

  constructor (source: ImageSourcePropType) {
    this.source = source
    this.component = ({ style, onPress }) =>  {
      if (onPress !== undefined) {
        return <TouchableOpacity onPress={ onPress } style={ style }>{ this.img() }</TouchableOpacity>
      }
      return this.img(style)
    }
  }

  img (style?: FlexStyle, ref?: React.RefObject<Image>, onLayout?: () => any) {
    const imgStyle = style as ImageStyle
    if (style && imgStyle.resizeMode === 'stretch') {
      return <Image ref={ ref } onLayout={ onLayout } source={ this.source } style={ imgStyle } fadeDuration={ 0 } />
    }
    return <Image ref={ ref } onLayout={ onLayout } source={ this.source } style={ imgStyle } />
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

  render (style?: ViewStyle, ref?: React.RefObject<View>, onLayout?: () => any) {
    if (style === null || style === undefined) {
      style = this._columsStyle
    } else {
      style = {
        ...this._columsStyle,
        ...style
      }
    }
    return <View style={ style } ref={ ref } onLayout={ onLayout }>
      <View style={ this._rows[0] }>
        <Image source={ this._slices[0] } style={ this._styles[0] } fadeDuration={ 0 } />
        <Image source={ this._slices[1] } style={ this._styles[1] } fadeDuration={ 0 } />
        <Image source={ this._slices[2] } style={ this._styles[2] } fadeDuration={ 0 } />
      </View>
      <View style={ this._rows[1] }>
        <Image source={ this._slices[3] } style={ this._styles[3] } fadeDuration={ 0 } />
        <Image source={ this._slices[4] } style={ this._styles[4] } fadeDuration={ 0 } />
        <Image source={ this._slices[5] } style={ this._styles[5] } fadeDuration={ 0 } />
      </View>
      <View style={ this._rows[2] }>
        <Image source={ this._slices[6] } style={ this._styles[6] } fadeDuration={ 0 } />
        <Image source={ this._slices[7] } style={ this._styles[7] } fadeDuration={ 0 } />
        <Image source={ this._slices[8] } style={ this._styles[8] } fadeDuration={ 0 } />
      </View>
    </View>
  }
}

const images = new Cache<ImageAsset, ImageSourcePropType> (ImageAsset) // !!!images
const slice9s = new Cache<Slice9, Slice9Args> (Slice9) // !!!slice9

export const Asset = {
  // ^properties
  // ^image
  $name () {
    return images.fetch('$name', () => require('../$asset'))
  }
  // $image
  , // !!!skip
  // ^slice9
  $slice9 () {
    return slice9s.fetch('$slice9', () => ({
      w: Number('$width'), h: Number('$height'), slice: { x: Number('$sliceX'), y: Number('$sliceY'), w: Number('$sliceWidth'), h: Number('$sliceHeight') },
      slices: [
        require('../$path0'),
        require('../$path1'),
        require('../$path2'),
        require('../$path3'),
        require('../$path4'),
        require('../$path5'),
        require('../$path6'),
        require('../$path7'),
        require('../$path8')
      ]
    }))
  }
  // $slice9
  // $properties
}
