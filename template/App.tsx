import React, { useState, useEffect } from 'react'
import 'react-native-gesture-handler' // Imported to fix gesture error in tab navigation
import { SafeAreaProvider, useSafeArea } from 'react-native-safe-area-context'
import { Text, StatusBar, View, StatusBarStyle } from 'react-native'
import { Loading } from './src/screens/Loading'
import { loadFonts } from './src/styles/Font'
import { NavigationContainer, navigationRef } from './src/screens/util/navigate'
import { elementHeader } from './src/styles/component/elementHeader'

function TopBar ({ backgroundColor, barStyle }: { backgroundColor: string, barStyle: StatusBarStyle }): JSX.Element {
  const safeArea = useSafeArea()
  return <>
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent /* Setting translucent to ture prevents awkward resize jumps on android */
    />
    <View
      style={{ height: safeArea.top, backgroundColor }} /* iOS needs the header to be shown, else it will draw just the default grey */
    />
  </>
}

/**
 * This definition runs before the app. It load the actual App and fonts.
 * In case the app has an error on import, the error will be displayed.
 */
export default function App (): JSX.Element {
  const [error, setError] = useState<Error>()
  const [loaded, setLoaded] = useState<{ App: () => JSX.Element }>()
  useEffect(() => { // Make sure that re-renderings don't cause to reload the App
    Promise.all([
      import('./src/App'), // Load the app asynchronously
      loadFonts() // Load the fonts
    ])
      .then(([{ App }]) => {
        if (App === null || App === undefined) {
          throw new Error('No Screen returned by ./src/App.tsx')
        }
        setLoaded({ App })
      })
      .catch(error => {
        console.error(error)
        setError(error)
      })
  }, [])
  return <SafeAreaProvider>
    <NavigationContainer ref={navigationRef}>
      <View style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <TopBar barStyle='light-content' backgroundColor={elementHeader.topBar.fill.color} />
        <View style={{ flexGrow: 1 }}>
          {
            (error !== undefined)
              ? <Text>{`Error while initing:\n${String(error)}`}</Text>
              : (loaded !== undefined)
                ? <loaded.App />
                : <Loading />
          }
        </View>
      </View>
    </NavigationContainer>
  </SafeAreaProvider>
}
