import sketch, { Document } from 'sketch/dom'
import { write } from '../util/fs'
import { iterateDocument } from '../util/dom'
import { slugify } from '../util/string'

function slugifyName (name: string): string[] {
  return name.split('/').map(part => slugify(part))
}

export function writeAssets (document: Document, target: (path: string) => string): { [id: string]: string } {
  const idNameMap: { [id: string]: string } = {}
  const assets: { [key: string]: string } = {}
  let assetFound = false
  iterateDocument(document, item => {
    if (item.exportFormats.length > 0) {
      const name = slugifyName(item.name)
      const fileName = `assets/${name.join('/')}`
      item.exportFormats.forEach(format => {
        assetFound = true
        const buffer = sketch.export(item, {
          output: false,
          scales: format.size
        })
        write(target(`${fileName}@${format.size}.${format.fileFormat}`), buffer)
      })
      if (assetFound) {
        assets[name.join('_')] = `${fileName}.${item.exportFormats[0].fileFormat}`
        idNameMap[item.id] = name.join('_')
      }
    }
  })
  if (assetFound) {
    write(target('src/Asset.ts'), `
const { Image } from 'react-native'

const cache: { [key: string]: Image } = {}

export class Asset {
${Object.keys(assets).map(name => {
  const asset = assets[name]
  return `  static get ${name} () {
    if (cache.${name} === undefined) {
      cache.${name} = require('../${asset}')
    }
    return cache.${name}
  }`
}).join('\n')}
}
`)
  }
  return idNameMap
}
