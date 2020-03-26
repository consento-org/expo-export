import React, { forwardRef, Ref } from 'react'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createBottomTabBar } from './util/createBottomTabBar'
import { ScreenA } from './ScreenA'
import { ScreenB } from './ScreenB'
import { componentNavbarBottom } from '../styles/component/componentNavbarBottom'

export const Screens = forwardRef((_, ref: Ref<any>): JSX.Element => {
  const Container = (() => {
    const AppNavigator = createStackNavigator({
      main: {
        path: '',
        screen: createBottomTabBar({
          screenA: {
            label: componentNavbarBottom.a.text.label,
            screen: () => <ScreenA />
          },
          screenB: {
            label: componentNavbarBottom.b.text.label,
            screen: () => <ScreenB />
          }
        })
      }
    }, {
      headerMode: 'none',
      initialRouteKey: 'vaults'
    })
    return createAppContainer(AppNavigator)
  })()
  return <Container ref={ref} />
})
