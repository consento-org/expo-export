import React from 'react'
import { View, ViewStyle, TouchableOpacity } from 'react-native'
import { elementButton } from '../../styles/component/elementButton'
import { localized, Locale } from '../util/locale'

const label = localized({ [Locale.ja]: elementButton.labelJa, [Locale.en]: elementButton.labelEn })

const styles = {
  container: {
    width: elementButton.width,
    height: elementButton.height
  } as ViewStyle,
  touch: {
    top: 0,
    left: 0,
    width: elementButton.width,
    height: elementButton.height
  } as ViewStyle
}

export const Button = ({ onPress, value }: { value?: string, onPress?: () => any }) => {
  return <View style={styles.container}>
    <TouchableOpacity onPress={onPress}>
      <View style={styles.touch}>
        <elementButton.bg.Render />
        <label.Render value={value} />
      </View>
    </TouchableOpacity>
  </View>
}
