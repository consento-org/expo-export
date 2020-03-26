// This file has been generated with expo-export@3.6.2, a Sketch plugin.
import * as ExpoFont from 'expo-font'

export enum Font {
  RalewayMediumItalic = 'Raleway-MediumItalic'
}

export async function loadFonts (): Promise<void> {
  await ExpoFont.loadAsync({
    [Font.RalewayMediumItalic]: require('../../assets/fonts/Raleway-MediumItalic.ttf')
  })
}
