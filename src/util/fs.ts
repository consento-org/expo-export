import fs from '@skpm/fs'

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

export function write (pth: string, data: any): boolean {
  // const current = fs.readFileSync(pth)
  mkdirp(dirname(pth))
  const res = fs.writeFileSync(pth, data)
  console.log(`Wrote ${pth}.`)
  return res
}

export function mkdirp (pth: string): boolean {
  let elements
  let created = false
  while (!fs.existsSync(pth)) {
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
      fs.mkdirSync(pth)
      created = true
    }
  }
  return created
}
