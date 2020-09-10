import { applyRenderOptions, IBaseProps, SketchInLayer } from './SketchInLayer'
import { Text, TextInput, TextStyle, ReturnKeyTypeOptions } from 'react-native'
import { TTextContentType, TextBox } from '../TextBox'
import { ILayer } from '../types'

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
  value?: string
  layer: ILayer
  prototype: TextBox
}

export const SketchTextBox = (props: ITextProps): JSX.Element => {
  return SketchInLayer({
    ...props,
    place: props.prototype.place,
    item: ({ ref, style }) => props.prototype.render({
      value: props.value ?? props.prototype.text,
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
  })
}
