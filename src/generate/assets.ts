import sketch, { Document, AnyLayer, Slice, Artboard } from 'sketch/dom'
import { write, readPluginAsset } from '../util/fs'
import { iterateDocument, isIgnored, isSlice9 } from '../util/dom'
import { slugifyName, childName, stringSort } from '../util/string'
import { template, replace } from '../util/template'
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
  return assetPath((artboard === null || artboard === undefined ? item : artboard).name + suffix, '1', item.exportFormats[0].fileFormat)
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
  for (let row = 0; row < 3; row++) {
    const y = row === 0 ? 0 : row === 1 ? item.frame.y : item.frame.y + item.frame.height
    const height = row === 0 ? item.frame.y : row === 1 ? item.frame.height : artboard.frame.height - item.frame.height - item.frame.y
    for (let column = 0; column < 3; column++) {
      const x = column === 0 ? 0 : column === 1 ? item.frame.x : item.frame.x + item.frame.width
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
    if (/^slice-9-[012]-[012]$/.test(item.name)) {
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
${template(readPluginAsset('Asset.tsx').toString(), {
    lines: {
      skip: () => '',
      images: input => Object.keys(assets).length > 0 ? input : '',
      slice9: input => Object.keys(slice9s).length > 0 ? input : ''
    },
    blocks: {
      properties: parts => {
        let result = []
        template(parts, {
          blocks: {
            image: template => {
              result = result.concat(
                Object.keys(assets).sort(stringSort).map(name => {
                  const asset = assets[name]
                  return replace(template, {
                    name, asset
                  })
                })
              )
              return ''
            },
            slice9: template => {
              result = result.concat(
                Object.keys(slice9s).sort(stringSort).map(name => {
                  const slice9 = slice9s[name]
                  return replace(template, {
                    slice9: name,
                    width: slice9.width,
                    height: slice9.height,
                    sliceX: slice9.slice.x,
                    sliceY: slice9.slice.y,
                    sliceW: slice9.slice.width,
                    sliceH: slice9.slice.height,
                    path0: slice9.path(0, 0),
                    path1: slice9.path(0, 1),
                    path2: slice9.path(0, 2),
                    path3: slice9.path(1, 0),
                    path4: slice9.path(1, 1),
                    path5: slice9.path(1, 2),
                    path6: slice9.path(2, 0),
                    path7: slice9.path(2, 1),
                    path8: slice9.path(2, 2)
                  })
                })
              )
              return ''
            }
          }
        })
        return result.map(entry => entry.replace(/\n$/ig, '')).join(',\n') + '\n'
      }
    }
  })}
`)
  }
  return idNameMap
}
