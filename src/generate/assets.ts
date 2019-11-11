import sketch, { Document, AnyLayer, Slice, Artboard } from 'sketch/dom'
import { write } from '../util/fs'
import { iterateDocument, isIgnored, isSlice9 } from '../util/dom'
import { slugifyName, childName } from '../util/string'
import { disclaimer } from './disclaimer'

export function assetPath (name: string, size: string, fileFormat: string): string {
  let fileName = slugifyName(name).join('/')
  if (size !== '1' && size !== '1x') {
    fileName = `${fileName}@${size}`
  }
  return `assets/${fileName}.${fileFormat}`
}

export function assetPathForLayer (item: AnyLayer, artboard: Artboard | null, suffix: string = ''): string {
  if (isIgnored(item)) {
    throw new Error(`Layer ${item.name} is ignored and should not be exported.`)
  }
  if (item.exportFormats.length === 0) {
    throw new Error(`Layer ${item.name} is not exported and cant be turned into an asset path.`)
  }
  return assetPath((artboard || item).name + suffix, '1', item.exportFormats[0].fileFormat)
}

export interface ISlice9 {
  path: (row: number, column: number) => string
  width: number
  height: number
  slice: {
    x: number
    y: number
    width: number
    height: number
  }
}

function slice9Export (item: Slice, target: (path: string) => string, slice9s: { [assetName: string]: ISlice9 }, idNameMap: { [id: string]: string }): void {
  const artboard = item.getParentArtboard()
  if (artboard === null || artboard === undefined) {
    return
  }
  const workSlice = item.duplicate()
  for (let row = 0; row < 3; row ++) {
    const y      = row === 0 ? 0            : row === 1 ? item.frame.y      : item.frame.y + item.frame.height
    const height = row === 0 ? item.frame.y : row === 1 ? item.frame.height : artboard.frame.height - item.frame.height - item.frame.y
    for (let column = 0; column < 3; column ++) {
      const x     = column === 0 ? 0            : column === 1 ? item.frame.x     : item.frame.x + item.frame.width
      const width = column === 0 ? item.frame.x : column === 1 ? item.frame.width : artboard.frame.width - item.frame.width - item.frame.x
      workSlice.name = `slice-9-${row}-${column}`
      workSlice.frame.x = x
      workSlice.frame.y = y
      workSlice.frame.width = width
      workSlice.frame.height = height
      workSlice.exportFormats.forEach(format => {
        const buffer = sketch.export(workSlice, {
          output: false,
          scales: format.size
        })
        write(target(assetPath(`${artboard.name}-${row}-${column}`, format.size, format.fileFormat)), buffer)
      })
    }
  }
  const slice9Name = childName(artboard.name)
  slice9s[slice9Name] = {
    width: artboard.frame.width,
    height: artboard.frame.height,
    path: (row: number, column: number) => assetPathForLayer(item, artboard, `-${row}-${column}`),
    slice: {
      x: item.frame.x,
      y: item.frame.y,
      width: item.frame.width,
      height: item.frame.height
    }
  }
  idNameMap[artboard.id] = slice9Name
  workSlice.remove()
}

export function writeAssets (document: Document, target: (path: string) => string): { [id: string]: string } {
  const idNameMap: { [id: string]: string } = {}
  const assets: { [key: string]: string } = {}
  const slice9s: { [key: string]: ISlice9 } = {}
  let assetFound = false
  iterateDocument(document, item => {
    if (/^slice\-9-[012]-[012]$/.exec(item.name)) {
      // remove slice-9 garbage
      item.remove()
      return
    }
    if (isSlice9(item)) {
      slice9Export(item, target, slice9s, idNameMap)
      return
    }
    if (item.exportFormats.length > 0) {
      item.exportFormats.forEach(format => {
        assetFound = true
        const buffer = sketch.export(item, {
          output: false,
          scales: format.size
        })
        write(target(assetPath(item.name, format.size, format.fileFormat)), buffer)
      })
      if (assetFound) {
        const assetName = childName(item.name)
        assets[assetName] = assetPathForLayer(item, null)
        idNameMap[item.id] = assetName
      }
    }
  })
  if (assetFound) {
    write(target('src/Asset.tsx'), `${disclaimer}
import React from 'react'
import { Image, ImageStyle, View, ViewStyle, ImageSourcePropType } from 'react-native'

class Cache<Type, Args> {
  cache: { [key: string]: Type } = {}
  clazz: { new (Args): Type }

  constructor (clazz: { new (Args: Args): Type }) {
    this.clazz = clazz
  }

  fetch (key: string, load: () => Args): Type {
    let result = this.cache[key]
    if (result === undefined) {
      result = new this.clazz(load())
      this.cache[key] = result
    }
    return result
  }
}

export class ImageAsset {
  source: ImageSourcePropType

  constructor (source: ImageSourcePropType) {
    this.source = source
  }

  img (style?: ImageStyle) {
    return <Image source={ this.source } style={ style } />
  }
}

export interface Slice9Args {
  w: number
  h: number
  slice: {
    x: number
    y: number
    w: number
    h: number
  }
  slices: ImageSourcePropType[]
}

const rowsStyle: ViewStyle = {
  display: 'flex',
  width: '100%',
  flexDirection: 'row'
}

export class Slice9 {
  width: number
  height: number
  _rows: ViewStyle[]
  _columsStyle: ViewStyle
  _styles: ImageStyle[]
  _slices: ImageSourcePropType[]

  constructor ({ w, h, slice, slices }: Slice9Args) {
    this.width = w
    this.height = h
    const right = w - slice.x - slice.w
    const bottom = h - slice.y - slice.h
    this._columsStyle = {
      display: 'flex',
      width: w,
      height: h,
      flexDirection: 'column'
    }
    this
    this._rows = [{
      ...rowsStyle,
      height: slice.y
    }, {
      ...rowsStyle,
      flexGrow: 1
    }, {
      ...rowsStyle,
      height: bottom
    }].map((rowStyle: ViewStyle) => Object.freeze(rowStyle))
    this._styles = [
      { width: slice.x, height: slice.y },
      { flexGrow: 1, height: slice.y },
      { width: right, height: slice.y },
      { width: slice.x, height: '100%' },
      { flexGrow: 1, height: '100%', borderWidth: 1 },
      { width: right, height: '100%' },
      { width: slice.x, height: bottom },
      { flexGrow: 1, height: bottom },
      { width: right, height: bottom }
    ].map((style: ImageStyle) => {
      // Causes images to flicker on first render
      // It looks weird if only the streched images flicker.
      style.resizeMode = 'stretch'
      return Object.freeze(style)
    })
    if (slices.length !== 9) {
      throw new Error('For a slice-9 we need 9 resources!')
    }
    this._slices = slices
  }

  render (style?: ViewStyle) {
    if (style === null || style === undefined) {
      style = this._columsStyle
    } else {
      style = {
        ...this._columsStyle,
        ...style
      }
    }
    return <View style={ style }>
      <View style={ this._rows[0] }>
        <Image source={ this._slices[0] } style={ this._styles[0] } fadeDuration={ 0 } />
        <Image source={ this._slices[1] } style={ this._styles[1] } fadeDuration={ 0 } />
        <Image source={ this._slices[2] } style={ this._styles[2] } fadeDuration={ 0 } />
      </View>
      <View style={ this._rows[1] }>
        <Image source={ this._slices[3] } style={ this._styles[3] } fadeDuration={ 0 } />
        <Image source={ this._slices[4] } style={ this._styles[4] } fadeDuration={ 0 } />
        <Image source={ this._slices[5] } style={ this._styles[5] } fadeDuration={ 0 } />
      </View>
      <View style={ this._rows[2] }>
        <Image source={ this._slices[6] } style={ this._styles[6] } fadeDuration={ 0 } />
        <Image source={ this._slices[7] } style={ this._styles[7] } fadeDuration={ 0 } />
        <Image source={ this._slices[8] } style={ this._styles[8] } fadeDuration={ 0 } />
      </View>
    </View>
  }
}

const images = new Cache<ImageAsset, ImageSourcePropType> (ImageAsset)
const slice9s = new Cache<Slice9, Slice9Args> (Slice9)

export const Asset = {
${
  Object.keys(assets).map(name => {
    const asset = assets[name]
    return `  ${name} () {
    return images.fetch('${name}', () => require('../${asset}'))
  }`
  }).concat(Object.keys(slice9s).map(name => {
    const slice9 = slice9s[name]
    return `  ${name} () {
    return slice9s.fetch('buttonBackgroundEnabled', () => ({
      w: ${slice9.width}, h: ${slice9.height}, slice: { x: ${slice9.slice.x}, y: ${slice9.slice.y}, w: ${slice9.slice.width}, h: ${slice9.slice.height} },
      slices: [
        require('../${slice9.path(0, 0)}'),
        require('../${slice9.path(0, 1)}'),
        require('../${slice9.path(0, 2)}'),
        require('../${slice9.path(1, 0)}'),
        require('../${slice9.path(1, 1)}'),
        require('../${slice9.path(1, 2)}'),
        require('../${slice9.path(2, 0)}'),
        require('../${slice9.path(2, 1)}'),
        require('../${slice9.path(2, 2)}')
      ]
    }))
  }`
})).join(',\n')}
}
`)
  }
  return idNameMap
}
