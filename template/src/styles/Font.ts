// This file has been generated with expo-export@3.8.0, a Sketch plugin.
import * as ExpoFont from 'expo-font'

export enum Font {
  KellySlabRegular = 'KellySlab-Regular',
  RobotoRegular = 'Roboto-Regular',
  NotoSansJPRegular = 'NotoSansJP-Regular'
}

export async function loadFonts (): Promise<void> {
  await ExpoFont.loadAsync({
    [Font.KellySlabRegular]: require('../../assets/fonts/KellySlab-Regular.ttf'),
    [Font.RobotoRegular]: require('../../assets/fonts/Roboto-Regular.ttf'),
    [Font.NotoSansJPRegular]: require('../../assets/fonts/NotoSansJP-Regular.ttf')
  })
}
