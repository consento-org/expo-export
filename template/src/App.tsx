import React, { useState } from 'react'
import { Screens } from './screens/Screens'
import { Loading } from './screens/Loading'

export const App = (): JSX.Element => {
  //
  // TODO: This is a stub for you to do application specific loading
  //       i.e. you might want to load the application data or similar here.
  //
  const [ready] = useState(true)
  if (!ready) {
    return <Loading />
  }
  return <Screens />
}

export default App
