import React from 'react'
import { Image, ImageStyle, TextStyle, TextInput, ViewStyle } from 'react-native'
import { TextBox } from './TextBox'
import { ImagePlacement } from './ImagePlacement'
import { Polygon } from './Polygon'
import { Slice9Placement } from './Slice9Placement'
import { IRenderOptions, renderItem, applyRenderOptions } from './react/SketchInLayer'

export class Layer {
  name: string
  backgroundColor: string | undefined
  width: number
  height: number

  constructor (name: string, width: number, height: number, backgroundColor?: string) {
    this.name = name
    this.backgroundColor = backgroundColor
    this.width = width
    this.height = height
    this.renderText = this.renderText.bind(this)
    this.renderPolygon = this.renderPolygon.bind(this)
    this.renderImage = this.renderImage.bind(this)
    this.renderSlice9 = this.renderSlice9.bind(this)
  }

  renderText ({ text, opts, value, style, onEdit, ref, onLayout, onBlur }: { text: TextBox, opts?: IRenderOptions, value?: string, style?: TextStyle, onEdit?: (text: string) => any, ref?: React.Ref<TextInput>, onLayout?: () => any, onBlur?: () => any }): JSX.Element {
    style = applyRenderOptions(opts, text.place, style)
    return renderItem(this, text.render({ value, style, onEdit, ref, onLayout, onBlur }), text.place, opts)
  }

  renderPolygon (polygon: Polygon, opts?: IRenderOptions, style?: ViewStyle): JSX.Element {
    style = applyRenderOptions(opts, polygon.place, style)
    return renderItem(this, polygon.RenderRect({ style }), polygon.place, opts)
  }

  renderImage (asset: ImagePlacement, opts?: IRenderOptions, style?: ImageStyle, ref?: React.Ref<Image>, onLayout?: () => any): JSX.Element {
    style = applyRenderOptions(opts, asset.place, style)
    if (opts.horz === 'stretch' || opts.vert === 'stretch') {
      style.resizeMode = 'stretch'
    }
    return renderItem(this, asset.img(style, ref, onLayout), asset.place, opts)
  }

  renderSlice9 (asset: Slice9Placement, opts?: IRenderOptions, style?: ViewStyle): JSX.Element {
    style = applyRenderOptions(opts, asset.place, style)
    return renderItem(this, asset.render(style), asset.place, opts)
  }
}
