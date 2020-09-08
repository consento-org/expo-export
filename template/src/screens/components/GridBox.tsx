import React from 'react'
import { View, ViewStyle } from 'react-native'
import { Locale, localeContent } from '../util/locale'
import { elementBox } from '../../styles/component/elementBox'

const style: ViewStyle = {
  width: elementBox.width,
  height: elementBox.height,
  backfaceVisibility: 'visible',
  backgroundColor: elementBox.bg.fill.color,
  margin: 5
}

const labels = { [Locale.ja]: elementBox.labelJa, [Locale.en]: elementBox.labelEn }

export const GridBox = ({ label }: { label: string }): JSX.Element => {
  const labelItem = localeContent(labels, label)
  return <View style={style}>
    <labelItem.Render value={label} />
  </View>
}
