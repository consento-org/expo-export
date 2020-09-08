import React, { forwardRef, Ref } from 'react'
import { View, ViewStyle, Animated } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import { screenMind } from '../styles/component/screenMind'
import { screenSpace } from '../styles/component/screenSpace'
import { screenTime } from '../styles/component/screenTime'
import { navigate } from './util/navigate'
import { localized, Locale } from './util/locale'
import { Header } from './components/Header'
import { SpaceContent } from './SpaceContent'
import { TimeContent } from './TimeContent'
import { MindContent } from './MindContent'
import { Component, ImagePlacement, Link, Text } from '../styles/Component'
import { ElementHeaderClass } from '../styles/component/elementHeader'

const root = createStackNavigator()

const mainScreenData: Array<{ name: string, design: IMainScreen, Content: () => JSX.Element }> = [
  { name: 'space', design: screenSpace, Content: () => <SpaceContent /> },
  { name: 'mind', design: screenMind, Content: () => <MindContent /> },
  { name: 'time', design: screenTime, Content: () => <TimeContent /> }
]

/**
 * We have multiple screens on the main screen which are all structured
 * the same way. To make sure that the designer doesns't mistake them,
 * we can define an interface that needs to be implemented.
 */
export interface IMainScreen extends Component {
  illustration: ImagePlacement
  left: ImagePlacement
  right: ImagePlacement
  header: Link<ElementHeaderClass, {}>
  titleEn: Text
  titleJa: Text
}

const mainScreens = mainScreenData.map(({ name, design, Content }) => {
  const mainStyle: ViewStyle = {
    backfaceVisibility: 'visible',
    backgroundColor: design.backgroundColor,
    display: 'flex',
    flexGrow: 1
  }
  const index = mainScreenData.findIndex(screen => screen.name === name)
  const next = mainScreenData[(index + 1) % mainScreenData.length]
  const prev = mainScreenData[(index === 0 ? mainScreenData.length : index) - 1]
  const sub = createStackNavigator()
  const title = localized({ [Locale.ja]: design.titleJa, [Locale.en]: design.titleEn })
  return () => {
    return <root.Screen key={name} name={name} options={{ headerShown: false }}>{
      () => <View style={mainStyle}>
        <Header design={design} screenName={name} /* The "header" property of "Screen" is not used due to a bug on iOS where the animation only affects the content */ />
        <sub.Navigator>
          <sub.Screen name='main' options={{ headerShown: false }}>{() => {
            return <View style={mainStyle}>
              <View style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{ width: '100%', height: title.place.bottom - design.illustration.place.top }}
                  onPress={() => navigate([name, 'content'])}
                >
                  <design.illustration.Render horz='center' vert='none' />
                  <title.Render
                    horz='center' vert='none'
                    style={{ top: title.place.top - design.illustration.place.top }}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ height: design.height - design.left.place.top }}>
                <design.left.Render horz='start' vert='none' onPress={() => navigate([prev.name, 'main'])} />
                <design.right.Render horz='end' vert='none' onPress={() => navigate([next.name, 'main'])} />
              </View>
            </View>
          }}</sub.Screen>
          <sub.Screen name='content' options={{ headerShown: false }} component={Content} />
        </sub.Navigator>
      </View>
    }</root.Screen>
  }
})

function multiply (progress: Animated.AnimatedInterpolation, outputRange: [number, number]): any {
  return {
    translateX: progress.interpolate({
      inputRange: [0, 1],
      outputRange,
      extrapolate: 'clamp'
    })
  }
}

const screenOptions: StackNavigationOptions = {
  cardStyleInterpolator: ({ current, next, layouts: { screen } }) => {
    // Moving from left -> right first and last card
    return {
      cardStyle: {
        transform: [
          multiply(current.progress, [screen.width, 0]),
          next?.progress === undefined ? multiply(next.progress, [0, -screen.width]) : { translateX: 0 }
        ]
      }
    }
  }
}

export const Screens = forwardRef((_, ref: Ref<any>): JSX.Element => {
  return <View style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }} ref={ref}>
    <root.Navigator
      initialRouteName={mainScreenData[0].name}
      screenOptions={screenOptions}
    >{mainScreens.map(renderer => renderer())}</root.Navigator>
  </View>
})
