import React, { Ref, useEffect } from 'react'
import { ViewStyle, View, Text, TextInput } from 'react-native'
import { elementInput } from '../../styles/component/elementInput'
import { localized, Locale } from '../util/locale'

const styles: { container: ViewStyle, bright: ViewStyle, labelElement: ViewStyle } = {
  container: {
    height: elementInput.height - elementInput.bg.place.top,
    width: '100%',
    marginTop: elementInput.bg.place.top,
    backfaceVisibility: 'visible',
    backgroundColor: elementInput.bg.fill.color,
    display: 'flex',
    alignItems: 'stretch'
  },
  bright: {
    height: '100%',
    marginLeft: elementInput.bright.place.left,
    marginRight: elementInput.width - elementInput.bright.place.right,
    backfaceVisibility: 'visible',
    backgroundColor: elementInput.bright.fill.color
  },
  labelElement: {
    top: elementInput.inputEn.place.top
  }
}

const labelElement = localized({ [Locale.ja]: elementInput.inputJa, [Locale.en]: elementInput.inputEn })

export const Input = ({ value, onEdit, targetRef }: { value?: string, onEdit: (text: string) => void, targetRef: Ref<Text | TextInput> }): JSX.Element => {
  useEffect(() => {
    onEdit(labelElement.text)
  }, [])
  return <View style={styles.container}>
    <View style={styles.bright}>
      <labelElement.Render targetRef={targetRef} vert='none' horz='none' value={value} onInstantEdit={onEdit} selectTextOnFocus style={styles.labelElement} />
    </View>
  </View>
}
