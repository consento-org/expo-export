import React from 'react'
import { View, ViewStyle } from 'react-native'
import { withNavigation } from 'react-navigation'
import { screenB } from '../styles/component/screenB'
import { TNavigation } from './util/TNavigation'

const style: ViewStyle = {
  display: 'flex',
  flexGrow: 1,
  alignItems: 'center',
  justifyContent: 'center'
}

export const ScreenB = withNavigation(({ navigation }: { navigation: TNavigation }): JSX.Element => {
  console.log({ navigation: navigation.state })
  return <View style={style}>
    {screenB.title.render({})}
  </View>
})
