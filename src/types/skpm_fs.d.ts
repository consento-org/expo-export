declare module '@skpm/fs' {

  class Stat {
    mtime: Date
    ctime: Date
    birthtime: Date
    uid: number
    gid: number
    mTimeMs: number
    cTimeMs: number
    birthtimeMs: number
    mode: number
    isFile (): boolean
    isDirectory (): boolean
    isFIFO (): boolean
  }

  const out: {
    existsSync (path: string): boolean
    writeFileSync (path: string, data: string): boolean
    mkdirSync (path: string): boolean
    readFileSync (path: string, encoding: string): string
    readFileSync (path: string): Buffer
    statSync (path: string): Stat
    Stat: Stat
  }
  export = out
}