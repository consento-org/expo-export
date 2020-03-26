import React from 'react'
import { View, ViewStyle } from 'react-native'
import { withNavigation } from 'react-navigation'
import { screenA } from '../styles/component/screenA'
import { TNavigation } from './util/TNavigation'

const style: ViewStyle = {
  display: 'flex',
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center'
}

export const ScreenA = withNavigation(({ navigation }: { navigation: TNavigation }): JSX.Element => {
  console.log({ navigation: navigation.state })
  return <View style={style}>
    {screenA.title.render({})}
  </View>
})
