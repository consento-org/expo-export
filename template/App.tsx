import React, { useState, useEffect } from 'react'
import 'react-native-gesture-handler' // Imported to fix gesture error in tab navigation
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Text } from 'react-native'
import { Loading } from './src/screens/Loading'
import { loadFonts } from './src/styles/Font'

/**
 * This definition runs before the app. It load the actual App and fonts.
 * In case the app has an error on import, the error will be displayed.
 */
export default function App (): JSX.Element {
  const [error, setError] = useState<Error>()
  const [loaded, setLoaded] = useState<{ App(): JSX.Element }>()
  useEffect(() => {
    Promise.all([
      import('./src/App'),
      loadFonts()
    ])
      .then(([{ App }]) => {
        if (App === null || App === undefined) {
          setLoaded({ App: (): JSX.Element => <Text>'No Screen returned by ./src/App.tsx'</Text> })
        }
        setLoaded({ App })
      })
      .catch(setError)
  }, [])
  if (error !== undefined) {
    return <Text>{`Error while initing:\n${String(error)}`}</Text>
  }
  if (loaded !== undefined) {
    try {
      return <SafeAreaProvider><loaded.App /></SafeAreaProvider>
    // eslint-disable-next-line no-unreachable
    } catch (err) {
      return <Text>{`Error: ${String(err)}`}</Text>
    }
  }
  return <SafeAreaProvider><Loading /></SafeAreaProvider>
}
