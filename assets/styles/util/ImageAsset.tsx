import React from 'react'
import { Image, ImageStyle, ImageSourcePropType, TouchableOpacity, FlexStyle, GestureResponderEvent } from 'react-native'
import { exists } from './lang'

export class ImageAsset {
  source: ImageSourcePropType
  component: (props: { style?: FlexStyle, onPress?: (event: GestureResponderEvent) => void }) => JSX.Element

  constructor (source: ImageSourcePropType) {
    this.source = source
    this.component = ({ style, onPress }) => {
      if (onPress !== undefined) {
        // eslint-disable-next-line react/react-in-jsx-scope
        return <TouchableOpacity onPress={onPress} style={style}>{this.img()}</TouchableOpacity>
      }
      return this.img(style)
    }
    this.img = this.img.bind(this)
  }

  img (style?: FlexStyle, ref?: React.Ref<Image>, onLayout?: () => any): JSX.Element {
    const imgStyle = style as ImageStyle
    if (exists(imgStyle) && imgStyle.resizeMode === 'stretch') {
      return <Image ref={ref} onLayout={onLayout} source={this.source} style={imgStyle} fadeDuration={0} />
    }
    return <Image ref={ref} onLayout={onLayout} source={this.source} style={imgStyle} />
  }
}
