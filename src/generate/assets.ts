import sketch, { Document, AnyLayer, Slice, Artboard } from 'sketch/dom'
import { isIgnored, getSlice9Layer, isArtboard, isExported, getDesignName } from '../util/dom'
import { slugifyName, childName, stringSort } from '../util/string'
import { ITypeScript, IOutput, IDataOutput, addImport, Imports, isFilled } from '../util/render'

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
    w: number
    h: number
    r: number
    b: number
  }
}

function * slice9Export (artboard: Artboard, item: Slice, slice9s: { [assetName: string]: ISlice9 }): Generator<IOutput> {
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
      for (const format of workSlice.exportFormats) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        yield ({
          pth: assetPath(`${artboard.name}-${row}-${column}`, format.size, format.fileFormat),
          data: sketch.export(workSlice, {
            output: false,
            scales: format.size
          })
        } as IDataOutput)
      }
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
      w: item.frame.width,
      h: item.frame.height,
      r: artboard.frame.width - item.frame.x - item.frame.width,
      b: artboard.frame.height - item.frame.y - item.frame.height
    }
  }
  workSlice.remove()
}

interface IAssetData {
  width: number
  height: number
  source: string
}

interface IAssetsData { [name: string]: IAssetData }
interface ISlice9s { [key: string]: ISlice9 }

function generateImages (designName: string, assets: IAssetsData): ITypeScript {
  const imports: Imports = {}
  addImport(imports, 'react-native', 'ImageSourcePropType')
  addImport(imports, './src/styles/util/Cache', 'createCache')
  addImport(imports, './src/styles/util/types', 'IImageAsset')
  return {
    pth: `./src/styles/${designName}/ImageAsset.ts`,
    imports,
    code: `
const lazySource = createCache<ImageSourcePropType>()

/* eslint-disable @typescript-eslint/consistent-type-assertions */
export const ImageAsset = {${
Object
  .keys(assets)
  .sort(stringSort)
  .map(name => {
    const asset = assets[name]
    return `
  ${name}: {
    name: '${name}',
    width: ${asset.width},
    height: ${asset.height},
    source: lazySource('${name}', () => require('../../../${asset.source}'))
  } as IImageAsset`
})
  .join(',')
}
}`
  }
}

function generateSlice9s (designName: string, slice9s: ISlice9s): ITypeScript {
  const imports: Imports = {}
  addImport(imports, 'react-native', 'ImageSourcePropType')
  addImport(imports, './src/styles/util/Cache', 'createCache')
  addImport(imports, './src/styles/util/Placement', 'Placement')
  addImport(imports, './src/styles/util/types', 'ISlice9')
  return {
    pth: `./src/styles/${designName}/Slice9.ts`,
    imports,
    code: `
const lazySlices = createCache<[
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType
]>()

/* eslint-disable @typescript-eslint/consistent-type-assertions */
export const Slice9 = {${
Object
  .keys(slice9s)
  .sort(stringSort)
  .map(name => {
    const slice9 = slice9s[name]
    const { slice } = slice9
    return `
  ${name}: {
    name: '${name}',
    width: ${slice9.width},
    height: ${slice9.height},
    slice: new Placement({ x: ${slice.x}, y: ${slice.y}, w: ${slice.w}, h: ${slice.h}, r: ${slice.r}, b: ${slice.b} }),
    slices: lazySlices('${name}', () => [
      require('../../../${slice9.path(0, 0)}'),
      require('../../../${slice9.path(0, 1)}'),
      require('../../../${slice9.path(0, 2)}'),
      require('../../../${slice9.path(1, 0)}'),
      require('../../../${slice9.path(1, 1)}'),
      require('../../../${slice9.path(1, 2)}'),
      require('../../../${slice9.path(2, 0)}'),
      require('../../../${slice9.path(2, 1)}'),
      require('../../../${slice9.path(2, 2)}')
    ])
  } as ISlice9`
  })
  .join(',')
}
}`
  }
}

export function * generateAssets (document: Document): Generator<IOutput> {
  const designName = getDesignName(document)
  const assets: IAssetsData = {}
  const slice9s: ISlice9s = {}
  for (const page of document.pages) {
    for (const artboard of page.layers) {
      if (!isArtboard(artboard)) continue
      if (isExported(artboard)) {
        for (const format of artboard.exportFormats) {
          const buffer = sketch.export(artboard, {
            output: false,
            scales: format.size
          })
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          yield ({
            pth: assetPath(artboard.name, format.size, format.fileFormat),
            data: buffer
          } as IDataOutput)
        }
        const assetName = childName(artboard.name)
        assets[assetName] = {
          source: assetPathForLayer(artboard, null),
          width: artboard.frame.width,
          height: artboard.frame.height
        }
        continue
      }
      const slice9 = getSlice9Layer(artboard)
      if (slice9 !== undefined) {
        for (const output of slice9Export(artboard, slice9, slice9s)) {
          yield output
        }
        continue
      }
      for (const layer of artboard.layers) {
        if (/^slice-9-[012]-[012]$/.test(layer.name)) {
          // remove slice-9 garbage, that may persist if previous operations failed
          layer.remove()
          continue
        }
      }
    }
  }
  if (isFilled(assets)) {
    yield generateImages(designName, assets)
  }
  if (isFilled(slice9s)) {
    yield generateSlice9s(designName, slice9s)
  }
}
