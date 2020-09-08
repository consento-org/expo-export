import React from 'react'
import { ViewStyle, View } from 'react-native'
import { elementLabel } from '../../styles/component/elementLabel'
import { localized, Locale } from '../util/locale'

const styles: { container: ViewStyle } = {
  container: {
    width: '100%',
    height: elementLabel.height
  }
}

const label = localized({ [Locale.ja]: elementLabel.labelJa, [Locale.en]: elementLabel.labelEn })

export const Label = ({ value }: { value?: string }): JSX.Element => {
  return <View style={styles.container}>
    <label.Render value={value} />
  </View>
}
