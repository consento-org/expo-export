import React, { FunctionComponent } from 'react'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { BottomTabBarOptions, NavigationBottomTabOptions, NavigationTabProp } from 'react-navigation-tabs/lib/typescript/src/types'
import { NavigationRouteConfigMap, NavigationRoute, NavigationParams, NavigationRouteConfig, CreateNavigatorConfig, NavigationTabRouterConfig } from 'react-navigation'
import { componentNavbarButton } from '../../styles/component/componentNavbarButton'
import { componentNavbarBottom } from '../../styles/component/componentNavbarBottom'

interface Config {
  lazy?: boolean
  tabBarComponent?: React.ComponentType<any>
  tabBarOptions?: BottomTabBarOptions
}

type NavigationTab = NavigationTabProp<NavigationRoute<NavigationParams>>

type BottomTabBarTabs = NavigationRouteConfigMap<NavigationBottomTabOptions, NavigationTab>
const config: CreateNavigatorConfig<
Partial<Config>,
NavigationTabRouterConfig,
Partial<NavigationBottomTabOptions>,
NavigationTabProp<NavigationRoute<NavigationParams>, any>
> = {
  tabBarOptions: {
    showLabel: true,
    activeBackgroundColor: componentNavbarBottom.active.fill.color,
    style: {
      backgroundColor: componentNavbarBottom.backgroundColor,
      height: componentNavbarBottom.height
    }
  }
}

export interface IBottomTabConfig {
  [key: string]: {
    label: string
    screen: FunctionComponent<any>
    tabBarIcon?: (props: {
      focused: boolean
      tintColor?: string
      horizontal?: boolean
    }) => React.ReactNode
  }
}

function createTabs (tabs: IBottomTabConfig): BottomTabBarTabs {
  const res = {}
  for (const key in tabs) {
    const { screen, label, tabBarIcon } = tabs[key]
    const tab: NavigationRouteConfig<NavigationBottomTabOptions, NavigationTab> = {
      path: key,
      screen,
      navigationOptions: {
        tabBarAccessibilityLabel: label,
        tabBarLabel: () => <componentNavbarButton.label.Render value={label} />,
        tabBarIcon
      }
    }
    res[key] = tab
  }
  return res
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createBottomTabBar (tabs: IBottomTabConfig) {
  return createBottomTabNavigator(createTabs(tabs), config)
}
