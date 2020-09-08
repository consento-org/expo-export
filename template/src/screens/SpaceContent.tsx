import React from 'react'
import { View } from 'react-native'
import { createBottomTabNavigator, BottomTabNavigationOptions, BottomTabBarOptions } from '@react-navigation/bottom-tabs'
import { elementBottomBar } from '../styles/component/elementBottomBar'
import { screenSpaceList } from '../styles/component/screenSpaceList'
import { screenSpaceGrid } from '../styles/component/screenSpaceGrid'
import { RouteProp, ParamListBase } from '@react-navigation/native'
import { ImagePlacement } from '../styles/Component'
import { ScrollView } from 'react-native-gesture-handler'
import { ListItem } from './components/ListItem'
import { GridBox } from './components/GridBox'
import { screenSpaceLongText } from '../styles/component/screenSpaceLongText'
import { localized, Locale } from './util/locale'

const Tab = createBottomTabNavigator()

const screenOptions = ({ route }: { route: RouteProp<ParamListBase, string> }): BottomTabNavigationOptions => {
  /**
   * The name of route is matched to layer names in the sketch document.
   * This way we create a shared vocabulary between the designer and the engineer.
   */
  const icon = elementBottomBar[route.name] as ImagePlacement
  return { tabBarIcon: () => icon.img() }
}

const tabBarOptions: BottomTabBarOptions = {
  inactiveBackgroundColor: elementBottomBar.backgroundColor,
  activeBackgroundColor: elementBottomBar.active.fill.color,
  style: {
    shadowOpacity: 0,
    height: elementBottomBar.height,
    borderTopColor: elementBottomBar.line.fill.color,
    borderTopWidth: elementBottomBar.line.border.thickness
  },
  showLabel: false
}

const List = (): JSX.Element =>
  <ScrollView style={{ backgroundColor: screenSpaceList.backgroundColor, height: '100%' }}>
    {
      ['hi', '今日！', 'di', 'ho', 'fix', 'me', 'up', 'break', 'you', 'down'].map((name, index) => <ListItem key={`list-${index}`} label={name} />)
    }
  </ScrollView>

const Grid = (): JSX.Element =>
  <ScrollView style={{ backgroundColor: screenSpaceGrid.backgroundColor, height: '100%' }}>
    <View style={{
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      marginTop: 10,
      marginBottom: 20
    }}>
      {
        ['hi', '今日！', 'di', 'ho', 'fix', 'me', 'up', 'break', 'you', 'down'].map((name, index) => <GridBox key={`list-${index}`} label={name} />)
      }
    </View>
  </ScrollView>

const longText = localized({ [Locale.ja]: screenSpaceLongText.textJa, [Locale.en]: screenSpaceLongText.textEn })

const LongText = (): JSX.Element =>
  <ScrollView style={{ backgroundColor: screenSpaceGrid.backgroundColor, height: '100%', width: '100%' }}>
    <View style={{ width: '100%', padding: 25 }}>
      <longText.render />
    </View>
  </ScrollView>

export const SpaceContent = (): JSX.Element => {
  // return // Render vert="none" horz="none" style={{ borderWidth: 1, width: 100, height: null }}/>
  return <Tab.Navigator screenOptions={screenOptions} tabBarOptions={tabBarOptions}>
    <Tab.Screen name='list' component={List} />
    <Tab.Screen name='grid' component={Grid} />
    <Tab.Screen name='longText' component={LongText} />
  </Tab.Navigator>
}
