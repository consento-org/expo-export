import sketch, { Document, AnyLayer } from 'sketch/dom'
import { write } from '../util/fs'
import { iterateDocument, isIgnored } from '../util/dom'
import { slugifyName, childName } from '../util/string'

export function assetPath (name: string, size: string, fileFormat: string): string {
  let fileName = slugifyName(name).join('/')
  if (size !== '1' && size !== '1x') {
    fileName = `${fileName}@${size}`
  }
  return `assets/${fileName}.${fileFormat}`
}

export function assetPathForLayer (item: AnyLayer): string {
  if (isIgnored(item)) {
    throw new Error(`Layer ${item.name} is ignored and should not be exported.`)
  }
  if (item.exportFormats.length === 0) {
    throw new Error(`Layer ${item.name} is not exported and cant be turned into an asset path.`)
  }
  return assetPath(item.name, '1', item.exportFormats[0].fileFormat)
}

export function writeAssets (document: Document, target: (path: string) => string): { [id: string]: string } {
  const idNameMap: { [id: string]: string } = {}
  const assets: { [key: string]: string } = {}
  let assetFound = false
  iterateDocument(document, item => {
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
        assets[assetName] = assetPathForLayer(item)
        idNameMap[item.id] = assetName
      }
    }
  })
  if (assetFound) {
    write(target('src/Asset.tsx'), `import React, { Image } from 'react-native'

class Assets {
  cache: { [key: string]: Asset } = {}

  fetch (key: string, load: () => any): Asset {
    let result = this.cache[key]
    if (result === undefined) {
      result = new Asset(load())
      this.cache[key] = result
    }
    return result
  }
}

const assets = new Assets ()

export class Asset {
  data: any
  constructor (data: any) {
    this.data = data
  }
  img () {
    return <Image source={ this.data } />
  }
${Object.keys(assets).map(name => {
    const asset = assets[name]
    return `  static ${name} () {
    return assets.fetch('${name}', () => require('../${asset}'))
  }`
  }).join('\n')}
}
`)
  }
  return idNameMap
}
