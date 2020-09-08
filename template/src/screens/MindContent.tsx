import React, { useState, createRef } from 'react'
import { View, Text, TextInput, Alert } from 'react-native'
import { Label } from './components/Label'
import { Input } from './components/Input'
import { Button } from './components/Button'

export const MindContent = (): JSX.Element => {
  const [input, setInput] = useState('')
  const ref = createRef<Text | TextInput>()
  return <View>
    <Label />
    <Input onEdit={setInput} targetRef={ref} />
    <Button onPress={() => { Alert.alert(input) }} />
  </View>
}
