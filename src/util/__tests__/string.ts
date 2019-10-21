import { slugify } from '../string'

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
