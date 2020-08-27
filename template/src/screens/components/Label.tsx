import React from 'react'
import { ViewStyle, View } from 'react-native'
import { elementLabel } from '../../styles/component/elementLabel'
import { localized, Locale } from '../util/locale'

const styles = {
  container: {
    width: '100%',
    height: elementLabel.height
  } as ViewStyle
}

const label = localized({ [Locale.ja]: elementLabel.labelJa, [Locale.en]: elementLabel.labelEn })

export const Label = ({ value }: { value?: string }) => {
  return <View style={ styles.container }>
    <label.Render value={value} />
  </View>
}
