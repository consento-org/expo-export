import { Override, SymbolInstance, Text, Document } from 'sketch/dom'
import { isSymbolInstance, isIgnored } from '../../util/dom'
import { exists } from '../../../assets/styles/util/lang'
import { isFilled } from '../../util/render'
import { childName } from '../../util/string'

class IPTextOverride {
  affectedLayer: Text
  textStyle: Override<Text, string>
  stringValue: Override<Text, string>
}

interface IPSymbolOverride {
  affectedLayer: SymbolInstance
  symbolID: Override<SymbolInstance, string>
  overrides?: IPOverrides
}

type IPOverride = IPTextOverride | IPSymbolOverride

function shorterPathsFirst (a: { path: string[], override: Override }, b: { override: Override, path: string[] }): number {
  if (a.path.length > b.path.length) return 1
  if (a.path.length < b.path.length) return -1
  return 0
}

function isIPSymbolOverride (override: IPOverride): override is IPSymbolOverride {
  return isSymbolInstance(override.affectedLayer, true)
}

function removeUnusedOverrides (overrides: IPOverrides): void {
  for (const [symbolId, override] of Object.entries(overrides)) {
    if (isIPSymbolOverride(override)) {
      if (!override.symbolID.isDefault) continue
      if (exists(override.overrides)) {
        removeUnusedOverrides(override.overrides)
        if (isFilled(override.overrides)) continue
      }
    } else if (
      !override.stringValue.isDefault ||
      !override.textStyle.isDefault
    ) continue
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete overrides[symbolId]
  }
}

export interface IOverrides {
  [prop: string]: SymbolOverride | TextOverride
}

export class SymbolOverride {
  target: string | null
  overrides: IOverrides | undefined

  constructor (target: string | null, overrides: IOverrides | undefined) {
    this.target = target
    this.overrides = overrides
  }
}

export class TextOverride {
  text: string | null
  styleID: string | null

  constructor (text: string | null, styleID: string | null) {
    this.text = text
    this.styleID = styleID
  }
}

function mapOverrides (document: Document, overrides: IPOverrides): IOverrides | undefined {
  const result = Object.entries(overrides).reduce((result, [_, override]) => {
    const name = childName(override.affectedLayer.name)
    if (isIPSymbolOverride(override)) {
      let target: string | null = null
      const master = document.getSymbolMasterWithID(override.symbolID.value)
      if (isIgnored(master)) {
        return result
      }
      if (!override.symbolID.isDefault) {
        target = childName(master.name)
      }
      result[name] = new SymbolOverride(target, mapOverrides(document, override.overrides))
    } else {
      result[name] = new TextOverride(
        override.stringValue.isDefault ? null : override.stringValue.value,
        override.textStyle.isDefault ? null : override.textStyle.value
      )
    }
    return result
  }, {})
  if (isFilled(result)) {
    return result
  }
}

function getOrCreateParent (reduced: IPOverrides, path: string[]): IPOverrides | null {
  let parent = reduced
  for (let i = 0; i < path.length - 1; i++) {
    const symbolID = path[i]
    const next: IPSymbolOverride | undefined = parent[symbolID] as any
    if (next === undefined) {
      return null
    }
    if (next.overrides === undefined) {
      next.overrides = {}
    }
    parent = next.overrides
  }
  return parent
}

interface IPOverrides {
  [symbolID: string]: IPOverride
}

function addOverride (parent: IPOverrides, symbolID: string, override: Override): void {
  if (parent[symbolID] === undefined) {
    parent[symbolID] = { affectedLayer: override.affectedLayer } as any
  }
  parent[symbolID][override.property] = override
}

export function processOverrides (document: Document, layer: SymbolInstance): { [prop: string]: SymbolOverride | TextOverride } | undefined {
  const reduced = layer.overrides
    .filter(override =>
      override.property === 'symbolID' ||
      override.property === 'textStyle' ||
      override.property === 'stringValue'
      // TODO: image, layerStyle, flowDestination!
    )
    .map(override => ({ override, path: override.path.split('/') }))
    .sort(shorterPathsFirst)
    .reduce((reduced, override): IPOverrides => {
      const parent = getOrCreateParent(reduced, override.path)
      if (parent === null) {
        console.error(`Can not process override: ${override.path.join(' → ')}`)
      } else {
        const symbolID = override.path[override.path.length - 1]
        addOverride(parent, symbolID, override.override)
      }
      return reduced
    }, {})
  removeUnusedOverrides(reduced)
  if (!isFilled(reduced)) {
    return
  }
  return mapOverrides(document, reduced)
}
