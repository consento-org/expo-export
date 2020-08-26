import { existsSync, readFileSync, statSync, writeFileSync, mkdirSync } from '@skpm/fs'

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

export function getConfigPaths (path: string): string[] {
  path = decodeURI(path)
  const reg = /^(.*)(\.sketch)$/ig
  const parts = reg.exec(path)
  const base = parts !== null ? parts[1] : path
  return [`${base}@expo`]
}

export interface IConfig {
  lookupPath: string
  targetFolder: string
}

export function targetFolder (path: string): (sub: string) => string {
  let config: IConfig
  for (const configPath of getConfigPaths(path)) {
    if (config === undefined) {
      config = { lookupPath: path, targetFolder: configPath }
    }
    if (existsSync(configPath) && statSync(configPath).isFile()) {
      config = {
        lookupPath: configPath,
        targetFolder: `${dirname(configPath)}/${readFileSync(configPath, 'utf-8').trim()}`
      }
      break
    }
  }
  if (existsSync(config.targetFolder) && statSync(config.targetFolder).isFile()) {
    throw new Error(`Target, derived from ${config.lookupPath}, is a file: ${config.targetFolder}`)
  }
  return (sub: string) => sub === '' ? config.targetFolder : `${config.targetFolder}/${sub}`
}

export function readPluginAsset (file: string): Buffer {
  return readFileSync(`${(global as any).context.plugin.url().absoluteString() as string}/Contents/Resources/${file}`.replace(/^file:\/\//, ''))
}

export function write (pth: string, data: any): boolean {
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
