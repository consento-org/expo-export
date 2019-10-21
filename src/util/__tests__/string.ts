import { slugify, LRUCache } from '../string'

describe('slugifications', () => {
  it('common cases', () => {
    expect(slugify('abcd')).toBe('abcd')
    expect(slugify(' abcd ')).toBe('abcd')
    expect(slugify('-abcd-')).toBe('abcd')
    expect(slugify('-ab cd-')).toBe('ab-cd')
    expect(slugify('-ab cd-')).toBe('ab-cd')
    expect(slugify('-ab漢字cd-')).toBe('abx6f22x5b57cd')
    expect(slugify('ABCD')).toBe('ABCD')
    expect(slugify('1234')).toBe('1234')
    expect(slugify('AÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇàáäâèéëêìíïîòóöôùúüûñç·/_,:;−–\t \n\r1234567890')).toBe('AAAAAEEEEIIIIOOOOUUUUNCaaaaeeeeiiiioooouuuunc-1234567890')
  })
})

describe('lrucache', () => {
  it('simple ', () => {
    const stack = []
    const c = LRUCache((key: string) => {
      stack.push(key)
      return key
    }, 2)
    expect(c('a')).toBe('a')
    expect(stack).toEqual(['a'])
    expect(c('a')).toBe('a')
    expect(stack).toEqual(['a'])
    expect(c('b')).toBe('b')
    expect(stack).toEqual(['a', 'b'])
    expect(c('a')).toBe('a')
    expect(stack).toEqual(['a', 'b'])
    expect(c('c')).toBe('c')
    expect(stack).toEqual(['a', 'b', 'c'])
    expect(c('b')).toBe('b')
    expect(stack).toEqual(['a', 'b', 'c', 'b'])
  })
})
