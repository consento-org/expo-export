import sketch, { Document, Layer } from 'sketch/dom'
import { write } from '../util/fs'
import { iterateDocument, isIgnored } from '../util/dom'
import { slugify, safeChildName } from '../util/string'

function slugifyName (name: string, separator: string = '-'): string[] {
  return name.split('/').map(part => slugify(part, separator))
}

export function assetPath (name: string, size: string, fileFormat: string): string {
  let fileName = slugifyName(name).join('/')
  if (size !== '1' && size !== '1x') {
    fileName = `${fileName}@${size}`
  }
  return `assets/${fileName}.${fileFormat}`
}

export function assetPathForLayer (item: Layer): string {
  if (isIgnored(item)) {
    throw new Error(`Layer ${item.name} is ignored and should not be exported.`)
  }
  if (item.exportFormats.length === 0) {
    throw new Error(`Layer ${item.name} is not exported and cant be turned into an asset path.`)
  }
  return assetPath(item.name, '1', item.exportFormats[0].fileFormat)
}

export function assetNameForLayer (layer: Layer): string {
  if (isIgnored(layer)) {
    throw new Error(`Layer ${layer.name} is ignored.`)
  }
  return safeChildName(slugifyName(layer.name, '_').join('_'))
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
        const assetName = assetNameForLayer(item)
        assets[assetName] = assetPathForLayer(item)
        idNameMap[item.id] = assetName
      }
    }
  })
  if (assetFound) {
    write(target('src/Asset.ts'), `import { Image } from 'react-native'

const cache: { [key: string]: Image } = {}

export const Asset = {
${Object.keys(assets).map(name => {
    const asset = assets[name]
    return `  ${name} () {
    if (cache.${name} === undefined) {
      cache.${name} = require('../${asset}')
    }
    return cache.${name}
  }`
  }).join(', \n')}
}
`)
  }
  return idNameMap
}
