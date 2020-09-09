import React from 'react'
import { TextStyle, Text as NativeText, TextInput, ReturnKeyTypeOptions } from 'react-native'
import { useDefault, exists } from './lang'
import { Component, TTextContentType, ITextBaseProps } from './Component'
import { Placement, IFrameData } from './Placement'

export interface ITextRenderOptions {
  value?: string
  style?: TextStyle
  ref?: React.Ref<NativeText | TextInput>
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

export class Text {
  text: string
  style: TextStyle
  styleAbsolute: TextStyle
  place: Placement
  parent: Component

  constructor (text: string, style: TextStyle, frame: IFrameData, parent: Component) {
    this.text = text
    this.style = style
    this.parent = parent
    this.place = new Placement(frame)
    this.styleAbsolute = {
      ...style,
      ...this.place.style(),
      position: 'absolute'
    }
    this.Render = this.Render.bind(this)
    this.render = this.render.bind(this)
    this.renderAbsolute = this.renderAbsolute.bind(this)
  }

  Render (props: ITextBaseProps): JSX.Element {
    return this.parent.Text({
      ...props,
      value: props.value === undefined ? this.text : props.value,
      prototype: this
    })
  }

  render (props: ITextRenderOptions): JSX.Element {
    let value = String(useDefault(props.value, this.text))
    const originalValue = value
    const isEditable = exists(props.onEdit) || exists(props.onInstantEdit)
    const onInstantEdit = useDefault(props.onInstantEdit, noop)
    const onEdit = useDefault(props.onEdit, noop)
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
    return <NativeText
      onLayout={props.onLayout}
      ref={props.ref}
      style={{
        ...this.style,
        ...props.style
      }}
      selectable={props.selectable}
    >{value}</NativeText>
  }

  renderAbsolute (opts: ITextRenderOptions): JSX.Element {
    if (opts.style === undefined || opts.style === null) {
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
