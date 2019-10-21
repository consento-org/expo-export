declare module '@skpm/fs' {
  const out: {
    existsSync (path: string): boolean
    writeFileSync (path: string, data: string): boolean
    mkdirSync (path: string): boolean
  }
  export = out
}