
jest.mock('@skpm/fs')

// eslint-disable-next-line
const { targetFolder, getConfigPaths } = require('../fs')

describe('looking up config path', () => {
  it('finds the right config paths', () => {
    expect(getConfigPaths('abc')).toEqual(['abc@expo'])
    expect(getConfigPaths('')).toEqual(['@expo'])
    expect(getConfigPaths('abc.sketch')).toEqual(['abc@expo'])
    expect(getConfigPaths(`${__dirname}/fs`)).toEqual([`${__dirname}/fs@expo`])
    expect(getConfigPaths(`${__dirname}/fsbroken`)).toEqual([`${__dirname}/fsbroken@expo`])
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
})
