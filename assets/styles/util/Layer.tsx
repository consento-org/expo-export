import React from 'react'
import { Image, ImageStyle, TextStyle, TextInput, Text, View, ViewStyle, FlexStyle, TouchableOpacity, GestureResponderEvent, Insets, ReturnKeyTypeOptions } from 'react-native'
import { useVUnits } from './useVUnits'
import { exists } from './lang'
import { TextBox } from './TextBox'
import { ImagePlacement } from './ImagePlacement'
import { Polygon } from './Polygon'
import { Slice9Placement } from './Slice9Placement'
import { Placement } from './Placement'

export type TRenderGravity = 'start' | 'end' | 'center' | 'stretch' | 'none'
export interface IRenderOptions {
  vert?: TRenderGravity
  horz?: TRenderGravity
  debug?: boolean
  hitSlop?: Insets
  onPress?: (event: GestureResponderEvent) => any
  onLayout?: () => any
}

function applyRenderOptions<T extends FlexStyle> ({ horz, vert }: IRenderOptions, place: Placement, style?: T): T {
  if (style === null || style === undefined) {
    style = {} as any
  }
  style.width = horz === 'stretch' ? '100%' : place.width
  style.height = vert === 'stretch' ? '100%' : place.height
  return style
}

export interface IBaseProps<T extends React.Component, TStyle extends FlexStyle> {
  targetRef?: React.Ref<T>
  vert?: TRenderGravity
  horz?: TRenderGravity
  style?: TStyle
  debug?: boolean
  onPress?: (event: GestureResponderEvent) => any
  onLayout?: () => any
}

export type TTextContentType = 'none'
| 'URL'
| 'addressCity'
| 'addressCityAndState'
| 'addressState'
| 'countryName'
| 'creditCardNumber'
| 'emailAddress'
| 'familyName'
| 'fullStreetAddress'
| 'givenName'
| 'jobTitle'
| 'location'
| 'middleName'
| 'name'
| 'namePrefix'
| 'nameSuffix'
| 'nickname'
| 'organizationName'
| 'postalCode'
| 'streetAddressLine1'
| 'streetAddressLine2'
| 'sublocality'
| 'telephoneNumber'
| 'username'
| 'password'
| 'newPassword'
| 'oneTimeCode'

export interface ITextBaseProps extends IBaseProps<Text | TextInput, TextStyle> {
  value?: string
  selectable?: boolean
  debug?: boolean
  selectTextOnFocus?: boolean
  textContentType?: TTextContentType
  selection?: {
    start: number
    end?: number
  }
  placeholder?: string
  placeholderTextColor?: string
  scrollEnabled?: boolean
  selectionColor?: string
  secureTextEntry?: boolean
  returnKeyType?: ReturnKeyTypeOptions
  onEdit?: (text: string) => any
  onInstantEdit?: (text: string) => any
  onBlur?: () => any
}

export interface ITextProps extends ITextBaseProps {
  value: string
  prototype: TextBox
}

export interface IPolygonProps extends IBaseProps<View, ViewStyle> {
  prototype: Polygon
}

export interface IImageProps extends IBaseProps<Image, ImageStyle> {
  prototype: ImagePlacement
}

export interface ISlice9Props extends IBaseProps<View, ViewStyle> {
  prototype: Slice9Placement
}

export interface IRenderProps<T extends React.Component, TStyle extends FlexStyle> extends IBaseProps<T, TStyle> {
  place: Placement
  debug?: boolean
  hitSlop?: Insets
  item: (opts: {
    ref?: React.Ref<T>
    style?: TStyle
  }) => JSX.Element
}

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
    this.Text = this.Text.bind(this)
    this.Polygon = this.Polygon.bind(this)
    this.Image = this.Image.bind(this)
    this.Slice9 = this.Slice9.bind(this)
    this.Render = this.Render.bind(this)
    this.renderText = this.renderText.bind(this)
    this.renderPolygon = this.renderPolygon.bind(this)
    this.renderImage = this.renderImage.bind(this)
    this.renderSlice9 = this.renderSlice9.bind(this)
  }

  Text (props: ITextProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const renderProps = {
      ...props,
      place: props.prototype.place,
      item: ({ ref, style }) => props.prototype.render({
        value: props.value,
        style: applyRenderOptions(props, props.prototype.place, style),
        onEdit: props.onEdit,
        onInstantEdit: props.onInstantEdit,
        selectable: props.selectable,
        selection: props.selection,
        selectTextOnFocus: props.selectTextOnFocus,
        placeholder: props.placeholder,
        placeholderTextColor: props.placeholderTextColor,
        returnKeyType: props.returnKeyType,
        scrollEnabled: props.scrollEnabled,
        secureTextEntry: props.secureTextEntry,
        selectionColor: props.selectionColor,
        textContentType: props.textContentType,
        ref,
        onBlur: props.onBlur
      })
    } as IRenderProps<Text, TextStyle>
    return this.Render(renderProps)
  }

  Polygon (props: IPolygonProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const renderProps = {
      ...props,
      place: props.prototype.place,
      item: ({ ref, style }) => props.prototype.RenderRect({
        style: applyRenderOptions(props, props.prototype.place, style),
        ref
      })
    } as IRenderProps<Text, TextStyle>
    return this.Render(renderProps)
  }

  Image (props: IImageProps): JSX.Element {
    const { prototype } = props
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const renderProps = {
      ...props,
      place: prototype.place,
      item: ({ ref, style }) => prototype.img(applyRenderOptions(props, prototype.place, style), ref)
    } as IRenderProps<Image, ImageStyle>
    return this.Render(renderProps)
  }

  Slice9 (props: ISlice9Props): JSX.Element {
    const { prototype } = props
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const renderProps = {
      ...props,
      place: prototype.place,
      item: ({ ref, style }) => prototype.render(applyRenderOptions(props, prototype.place, style), ref)
    } as IRenderProps<View, ViewStyle>
    return this.Render(renderProps)
  }

  Render <T extends React.Component, S extends FlexStyle> (props: IRenderProps<T, S>): JSX.Element {
    return this._renderItem(props.item({
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

  renderText ({ text, opts, value, style, onEdit, ref, onLayout, onBlur }: { text: TextBox, opts?: IRenderOptions, value?: string, style?: TextStyle, onEdit?: (text: string) => any, ref?: React.Ref<TextInput>, onLayout?: () => any, onBlur?: () => any }): JSX.Element {
    style = applyRenderOptions(opts, text.place, style)
    return this._renderItem(text.render({ value, style, onEdit, ref, onLayout, onBlur }), text.place, opts)
  }

  renderPolygon (polygon: Polygon, opts?: IRenderOptions, style?: ViewStyle): JSX.Element {
    style = applyRenderOptions(opts, polygon.place, style)
    return this._renderItem(polygon.RenderRect({ style }), polygon.place, opts)
  }

  renderImage (asset: ImagePlacement, opts?: IRenderOptions, style?: ImageStyle, ref?: React.Ref<Image>, onLayout?: () => any): JSX.Element {
    style = applyRenderOptions(opts, asset.place, style)
    if (opts.horz === 'stretch' || opts.vert === 'stretch') {
      style.resizeMode = 'stretch'
    }
    return this._renderItem(asset.img(style, ref, onLayout), asset.place, opts)
  }

  renderSlice9 (asset: Slice9Placement, opts?: IRenderOptions, style?: ViewStyle): JSX.Element {
    style = applyRenderOptions(opts, asset.place, style)
    return this._renderItem(asset.render(style), asset.place, opts)
  }

  _renderItem (item: React.ReactNode, place: Placement, { horz, vert, onPress, onLayout, debug, hitSlop }: IRenderOptions = {}): JSX.Element {
    const { vw, vh } = useVUnits()
    const style: ViewStyle = {
      position: 'absolute',
      width: place.width,
      height: place.height
    }
    if (!exists(horz) || horz === 'start') {
      style.left = place.left
    } else if (horz !== 'none') {
      const right = (this.width - place.right)
      if (horz === 'center') {
        style.left = vw(50) + (place.centerX - (this.width / 2)) - (place.width / 2)
      } else if (horz === 'stretch') {
        style.left = place.left
        style.width = vw(100) - right - place.left
      } else {
        style.left = vw(100) - right - place.width
      }
    }
    if (!exists(vert) || vert === 'start') {
      style.top = place.top
    } else if (vert !== 'none') {
      const bottom = (this.width - place.right)
      if (vert === 'center') {
        style.top = vh(50) + (place.centerY - (this.height / 2)) - (place.height / 2)
      } else if (vert === 'stretch') {
        style.top = place.top
        style.height = vh(100) - bottom - place.top
      } else {
        style.top = vh(100) - bottom - place.height
      }
    }
    if (debug) {
      style.borderColor = '#04a'
      style.backgroundColor = '#ac8888888'
      style.borderWidth = 1
      console.log({ style, horz, vert, place, width: this.width, height: this.height, vw100: vw(100), vh100: vh(100) })
    }
    if (exists(onPress)) {
      return <TouchableOpacity onLayout={onLayout} onPress={onPress} style={style} hitSlop={hitSlop}>{item}</TouchableOpacity>
    }
    return <View style={style}>{item}</View>
  }
}
