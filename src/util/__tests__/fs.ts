
jest.mock('@skpm/fs')

// eslint-disable-next-line
const { targetFolder, getConfigPaths, getConfig, resolve } = require('../fs')

describe('looking up config path', () => {
  it('finds the right config paths', () => {
    expect(getConfigPaths('abc')).toEqual(['abc@expo', 'abc@expo.json'])
    expect(getConfigPaths('')).toEqual(['@expo', '@expo.json'])
    expect(getConfigPaths('abc.sketch')).toEqual(['abc@expo', 'abc@expo.json'])
    expect(getConfigPaths(`${__dirname}/fs`)).toEqual([`${__dirname}/fs@expo`, `${__dirname}/fs@expo.json`])
    expect(getConfigPaths(`${__dirname}/fsbroken`)).toEqual([`${__dirname}/fsbroken@expo`, `${__dirname}/fsbroken@expo.json`])
  })
})

describe('loading config', () => {
  it('loading test config', () => {
    expect(getConfig('abc')).toEqual({ lookupPath: 'abc', targetFolder: 'abc@expo', exportHidden: false })
    expect(getConfig('')).toEqual({ lookupPath: '', targetFolder: '@expo', exportHidden: false })
    expect(getConfig(`${__dirname}/fs`)).toEqual({ lookupPath: `${__dirname}/fs@expo`, targetFolder: `${__dirname}/abcd`, exportHidden: false })
    expect(getConfig(`${__dirname}/fs_multiline`)).toEqual({ lookupPath: `${__dirname}/fs_multiline@expo`, targetFolder: `${__dirname}/abcd`, exportHidden: false })
    expect(() => getConfig(`${__dirname}/fsbroken`)).toThrowError()
  })
  it('json support', () => {
    expect(getConfig(`${__dirname}/fs_json_obj`)).toEqual({ lookupPath: `${__dirname}/fs_json_obj@expo`, targetFolder: `${__dirname}/higherImportance`, exportHidden: false })
    expect(getConfig(`${__dirname}/fs_json_str`)).toEqual({ lookupPath: `${__dirname}/fs_json_str@expo`, targetFolder: `${__dirname}/abcd`, exportHidden: false })
    expect(() => getConfig(`${__dirname}/fsbroken_json`)).toThrow()
    expect(() => getConfig(`${__dirname}/fsbroken_multiline`)).toThrow()
    expect(getConfig(`${__dirname}/fs_jsonext_str`)).toEqual({ lookupPath: `${__dirname}/fs_jsonext_str@expo.json`, targetFolder: `${__dirname}/abcd`, exportHidden: false })
    expect(getConfig(`${__dirname}/fs_obj`)).toEqual({ lookupPath: `${__dirname}/fs_obj@expo.json`, targetFolder: `${__dirname}/abcd`, exportHidden: false })
    expect(() => getConfig(`${__dirname}/fsbroken_nojson`)).toThrow()
  })
})

describe('resolve', () => {
  it('resolving paths', () => {
    expect(resolve('a', '/abcd')).toBe('/abcd')
    expect(resolve('x', './abcd')).toBe('x/abcd')
    expect(resolve('x', 'y')).toBe('x/y')
    expect(resolve('x', 'y/')).toBe('x/y')
    expect(resolve('/x', 'y')).toBe('/x/y')
    expect(resolve('/./x', 'y/./z')).toBe('/x/y/z')
    expect(resolve('x/../y/z', 'a/../b/c/../d')).toBe('y/z/b/d')
  })
})

describe('target folder lookup', () => {
  it('base', () => {
    expect(targetFolder('abc')('')).toBe('abc@expo')
    expect(targetFolder('abc.sketch')('')).toBe('abc@expo')
    expect(targetFolder(`${__dirname}/fs`)('')).toBe(`${__dirname}/abcd`)
  })
  it('child', () => {
    expect(targetFolder('abc')('hello')).toBe('abc@expo/hello')
    expect(targetFolder('abc')('hello/world')).toBe('abc@expo/hello/world')
  })
  it('broken base', () => {
    expect(() => targetFolder(`${__dirname}/fsbroken`)('')).toThrowError()
  })
  it('multiline trimming', () => {
    expect(targetFolder(`${__dirname}/fs_multiline`)('')).toBe(`${__dirname}/abcd`)
  })
})
