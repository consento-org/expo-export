
jest.mock('@skpm/fs')

// eslint-disable-next-line
const { targetFolder } = require('../fs')

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
