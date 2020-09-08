import React from 'react'
import { View, ViewStyle } from 'react-native'
import { screenTimeContent } from '../styles/component/screenTimeContent'
import { useSeconds } from './util/useSeconds'
import { Clock } from './components/Clock'

const styles: { container: ViewStyle, svg: ViewStyle} = {
  container: {
    flexGrow: 1,
    backgroundColor: screenTimeContent.backgroundColor,
    display: 'flex',
    alignItems: 'center'
  },
  svg: {
    marginTop: screenTimeContent.clock.place.top - screenTimeContent.header.place.height
  }
}

const width = screenTimeContent.clock.place.width
const height = screenTimeContent.clock.place.height

export const TimeContent = (): JSX.Element => {
  const time = useSeconds()
  return <View style={styles.container}>
    <Clock width={width} height={height} time={time} style={styles.svg} />
  </View>
}
