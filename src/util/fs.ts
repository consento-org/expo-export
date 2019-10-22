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

export function targetFolder (path: string): (sub: string) => string {
  path = decodeURI(path)
  const reg = /^(.*)(\.sketch)$/ig
  const parts = reg.exec(path)
  let base = parts !== null ? `${parts[1]}@expo` : `${path}@expo`
  if (existsSync(base)) {
    const stat = statSync(base)
    if (stat.isFile()) {
      const lookupPath = base
      base = `${dirname(base)}/${readFileSync(base, 'utf-8')}`
      if (existsSync(base) && statSync(base).isFile()) {
        throw new Error(`Target, read from ${lookupPath}, is a file: ${base}`)
      }
    }
  }
  return (sub: string) => sub === '' ? base : `${base}/${sub}`
}

export function write (pth: string, data: any): boolean {
  if (data === undefined) {
    console.log(`Skipping ${pth}.`)
    return
  }
  mkdirp(dirname(pth))
  const res = writeFileSync(pth, data)
  console.log(`Wrote ${pth}.`)
  return res
}

export function mkdirp (pth: string): boolean {
  let elements
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
