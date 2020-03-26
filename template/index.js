import 'expo/build/Expo.fx'
import registerRootComponent from 'expo/build/launch/registerRootComponent'
import { activateKeepAwake } from 'expo-keep-awake'

import App from './App'

// eslint-disable-next-line no-undef
if (__DEV__) {
  activateKeepAwake()
}

registerRootComponent(App)
