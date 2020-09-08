import React, { forwardRef, Ref } from 'react'
import { View, ViewStyle, TouchableWithoutFeedback } from 'react-native'
import { screenLoading } from '../styles/component/screenLoading'

const style: ViewStyle = {
  justifyContent: 'center',
  alignContent: 'center',
  alignItems: 'center',
  flex: 1,
  backgroundColor: screenLoading.backgroundColor
}

export const Loading = forwardRef((_, ref: Ref<View>): JSX.Element => {
  return <TouchableWithoutFeedback>
    <View style={style} ref={ref}>
      <screenLoading.splash.Render vert='none' horz='none' style={{ flexGrow: 1 }} />
    </View>
  </TouchableWithoutFeedback>
})
