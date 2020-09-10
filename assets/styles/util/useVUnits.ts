import { Dimensions, Keyboard, KeyboardEvent } from 'react-native'
import { createGlobalEffect } from './createGlobalEffect'

const mem = {
  vw: NaN,
  vh: NaN
}

let keyboardSize = 0

export enum Orientation {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export interface IVUnits {
  vw: (number: number) => number
  vh: (number: number) => number
  vmin: (number: number) => number
  vmax: (number: number) => number
  orientation: Orientation
  isHorz: boolean
  isVert: boolean
}

export const useVUnits = createGlobalEffect({
  update () {
    const { width, height } = Dimensions.get('window')
    const vw = width / 100
    const vh = (height - keyboardSize) / 100
    if (vw === mem.vw && vh === mem.vh) {
      return
    }
    mem.vw = vw
    mem.vh = vh
    const orientation = vw > vh ? Orientation.horizontal : Orientation.vertical
    return Object.freeze({
      vw: (number: number = 1) => vw * number,
      vh: (number: number = 1) => vh * number,
      vmin: (number: number = 1) => Math.min(vw * number, vh * number),
      vmax: (number: number = 1) => Math.max(vw * number, vh * number),
      orientation: orientation,
      isHorz: orientation === Orientation.horizontal,
      isVert: orientation === Orientation.vertical
    })
  },
  init: handler => {
    Dimensions.addEventListener('change', handler)
    const keyboardHandler = (e: KeyboardEvent): void => {
      keyboardSize = e.endCoordinates.height
      handler()
    }
    Keyboard.addListener('keyboardDidChangeFrame', keyboardHandler)
    Keyboard.addListener('keyboardDidShow', keyboardHandler)
    Keyboard.addListener('keyboardDidHide', keyboardHandler)
    return () => {
      Dimensions.removeEventListener('change', handler)
      Keyboard.removeListener('keyboardDidShow', keyboardHandler)
      Keyboard.removeListener('keyboardDidChangeFrame', keyboardHandler)
      Keyboard.removeListener('keyboardDidHide', keyboardHandler)
    }
  }
}) as () => IVUnits
