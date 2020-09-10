import React from 'react'
import { TextStyle, Text, TextInput, ReturnKeyTypeOptions } from 'react-native'
import { exists } from './lang'
import { Placement, IFrameData } from './Placement'

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

export interface ITextRenderOptions {
  value?: string
  style?: TextStyle
  ref?: React.Ref<Text | TextInput>
  selectable?: boolean
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
  onLayout?: () => any
  onBlur?: () => any
  onEdit?: (text: string) => any
  onInstantEdit?: (text: string) => any
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {}

export class TextBox {
  text: string
  style: TextStyle
  styleAbsolute: TextStyle
  place: Placement

  constructor (text: string, style: TextStyle, frame: IFrameData) {
    this.text = text
    this.style = style
    this.place = new Placement(frame)
    this.styleAbsolute = {
      ...style,
      ...this.place.style(),
      position: 'absolute'
    }
    this.render = this.render.bind(this)
    this.renderAbsolute = this.renderAbsolute.bind(this)
  }

  render (props: ITextRenderOptions): JSX.Element {
    let value = props.value ?? this.text
    const originalValue = value
    const isEditable = exists(props.onEdit ?? props.onInstantEdit)
    const onInstantEdit = props.onInstantEdit ?? noop
    const onEdit = props.onEdit ?? noop
    if (isEditable) {
      return <TextInput
        onChangeText={text => {
          onInstantEdit(value = text)
        }}
        onSubmitEditing={() => {
          if (originalValue !== value) {
            onEdit(value)
          }
        }}
        onBlur={props.onBlur}
        onLayout={props.onLayout}
        ref={props.ref as React.Ref<TextInput>}
        style={{
          ...this.style,
          ...props.style
        }}
        selectTextOnFocus={props.selectTextOnFocus}
        textContentType={props.textContentType}
        selection={props.selection}
        placeholder={props.placeholder}
        placeholderTextColor={props.placeholderTextColor}
        scrollEnabled={props.scrollEnabled}
        selectionColor={props.selectionColor}
        secureTextEntry={props.secureTextEntry}
        returnKeyType={props.returnKeyType}
      >{value}</TextInput>
    }
    return <Text
      onLayout={props.onLayout}
      ref={props.ref}
      style={{
        ...this.style,
        ...props.style
      }}
      selectable={props.selectable}
    >{value}</Text>
  }

  renderAbsolute (opts: ITextRenderOptions): JSX.Element {
    if (!exists(opts.style)) {
      opts.style = this.styleAbsolute
    } else {
      opts.style = {
        ...opts.style,
        ...this.styleAbsolute
      }
    }
    return this.render(opts)
  }
}
