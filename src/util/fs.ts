import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync, realpathSync } from '@skpm/fs'

export function dirname (name: string): string {
  const pos = name.lastIndexOf('/')
  if (pos === -1) {
    return '.'
  }
  if (pos === 0) {
    return '/'
  }
  return name.substr(0, pos)
}

export function basename (name: string): string {
  return name.substr(name.lastIndexOf('/') + 1)
}

export function resolve (base: string, path: string): string {
  if (path.charAt(0) !== '/') {
    path = `${base}/${path}`
  }
  const parts = path.split('/').filter(entry => entry !== '.')
  for (let i = 0; i < parts.length; i++) {
    if (parts[i + 1] === '..') {
      parts.splice(i, 2)
      i -= 1
    }
  }
  const result = parts.join('/')
  if (result === '/') {
    return result
  }
  if (/\/$/.test(result)) {
    return result.substr(0, result.length - 1)
  }
  return result
}

export function getConfigPaths (path: string): string[] {
  path = decodeURI(path)
  const reg = /^(.*)(\.sketch)$/ig
  const parts = reg.exec(path)
  const base = parts !== null ? parts[1] : path
  return [`${base}@expo`, `${base}@expo.json`]
}

export interface IConfig {
  lookupPath: string
  targetFolder: string
  exportHidden: boolean
}

export function getConfig (path: string): IConfig {
  let config: {
    lookupPath?: string
    targetFolder: string
    exportHidden?: any
  }
  for (const configPath of getConfigPaths(path)) {
    if (config === undefined) {
      config = { lookupPath: path, targetFolder: configPath }
    }
    if (existsSync(configPath) && statSync(configPath).isFile()) {
      const raw = readFileSync(configPath, 'utf-8').trim()
      if (/(^["{])|\n/m.test(raw) || /\.json$/.test(configPath)) {
        try {
          config = JSON.parse(raw)
        } catch (err) {
          throw new Error(`Configuration at ${config.lookupPath} is not a valid json file:\n${String(err)}`)
        }
        if (typeof config === 'string') {
          config = {
            targetFolder: config
          }
        } else if (typeof config.targetFolder !== 'string') {
          throw new Error(`Configuration at ${config.lookupPath} is missing the targetFolder property`)
        }
      } else {
        config = {
          targetFolder: raw
        }
      }
      config.lookupPath = configPath
      config.targetFolder = resolve(dirname(configPath), config.targetFolder)
      break
    }
  }
  if (existsSync(config.targetFolder) && statSync(config.targetFolder).isFile()) {
    throw new Error(`Target, derived from ${config.lookupPath}, is a file: ${config.targetFolder}`)
  }
  config.exportHidden = !!(config.exportHidden as boolean)
  return config as IConfig
}

export function getDesignNameByPath (path: string): string {
  return basename(path).replace(/\.sketch$/, '')
}

export function targetFolder (path: string): (sub: string) => string {
  const config = getConfig(path)
  return (sub: string) => {
    sub = sub.replace(/^\.\//, '')
    return sub === '' ? config.targetFolder : `${config.targetFolder}/${sub}`
  }
}

export function readPluginAsset (file: string, encoding: string): string
export function readPluginAsset (file: string): Buffer
export function readPluginAsset (file: string, encoding?: string): Buffer | string {
  let url = (global as any).context.plugin.url().absoluteString() as string
  if (!/\/$/.test(url)) {
    url += '/'
  }
  url = (`${url}Contents/Resources/${file}`).replace(/^file:\/\//, '')
  url = decodeURI(url)
  url = realpathSync(url)
  return readFileSync(url, encoding)
}

export function write (pth: string, data: any): boolean {
  pth = pth.replace(/^\.\//, '')
  if (data === undefined) {
    console.log(`Skipping ${pth}.`)
    return
  }
  mkdirp(dirname(pth))
  if (existsSync(pth)) {
    if (readFileSync(pth).toString() === data.toString()) {
      console.log(`No change ${pth}`)
      return
    }
  }
  const res = writeFileSync(pth, data)
  console.log(`Wrote ${pth}.`)
  return res
}

export function mkdirp (pth: string): boolean {
  let elements: string[]
  let created = false
  while (!existsSync(pth)) {
    const i = pth.lastIndexOf('/')
    if (i === -1) {
      break
    }
    const part = pth.substr(i + 1)
    pth = pth.substr(0, i)
    if (elements === undefined) elements = [part]
    else elements.unshift(part)
  }
  if (elements !== undefined) {
    while (elements.length > 0) {
      pth = `${pth}/${elements.shift()}`
      console.log(`Created folder ${pth}.`)
      mkdirSync(pth)
      created = true
    }
  }
  return created
}
