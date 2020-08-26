
jest.mock('@skpm/fs')

// eslint-disable-next-line
const { targetFolder, getConfigPaths, getConfig, resolve } = require('../fs')

describe('looking up config path', () => {
  it('finds the right config paths', () => {
    expect(getConfigPaths('abc')).toEqual(['abc@expo'])
    expect(getConfigPaths('')).toEqual(['@expo'])
    expect(getConfigPaths('abc.sketch')).toEqual(['abc@expo'])
    expect(getConfigPaths(`${__dirname}/fs`)).toEqual([`${__dirname}/fs@expo`])
    expect(getConfigPaths(`${__dirname}/fsbroken`)).toEqual([`${__dirname}/fsbroken@expo`])
  })
})

describe('loading config', () => {
  it('loading test config', () => {
    expect(getConfig('abc')).toEqual({ lookupPath: 'abc', targetFolder: 'abc@expo' })
    expect(getConfig('')).toEqual({ lookupPath: '', targetFolder: '@expo' })
    expect(getConfig(`${__dirname}/fs`)).toEqual({ lookupPath: `${__dirname}/fs@expo`, targetFolder: `${__dirname}/abcd` })
    expect(getConfig(`${__dirname}/fs_multiline`)).toEqual({ lookupPath: `${__dirname}/fs_multiline@expo`, targetFolder: `${__dirname}/abcd` })
    expect(() => getConfig(`${__dirname}/fsbroken`)).toThrowError()
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
