// remove accents, swap ñ for n, etc
const from = 'ÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇàáäâèéëêìíïîòóöôùúüûñç·/_,:;−–\t \n\r'
const to = 'AAAAEEEEIIIIOOOOUUUUNCaaaaeeeeiiiioooouuuunc-----------'
const reg = new RegExp(`[${from}]` as any, 'g')
const map: { [ key: string ]: string } = Array.from(from).reduce((map: { [key: string]: string }, char, index) => {
  const mapped = to.charAt(index)
  map[char] = mapped !== '' ? mapped : ''
  return map
}, {})

const NON_ALPHA_PREFIX = 'x'

export function safeChildName (input: string): string {
  input = input.replace(/_(.)/ig, (_, char) => char.toUpperCase())
  // Using the asset name as variable means that the name needs to start with an alphabetical character
  return /^[a-z]/i.test(input) ? input : `${NON_ALPHA_PREFIX}${input}`
}

export function slugifyRaw (str: string, separator: string = '-'): string {
  reg.lastIndex = -1
  return str
    .replace(reg, part => map[part])
    .replace(/[^a-z0-9 -]/ig, part => `x${part.charCodeAt(0).toString(16)}`) // remove invalid chars
    .replace(/^-+|-+$/g, '') // trim
    .replace(/-+/g, '-') // collapse dashes
    .replace(/-/ig, separator)
}

export function LRUCache<T> (handler: (key: string) => T, max: number = 1000): (key: string) => T {
  let count = 0
  const items = {}
  return (key: string): T => {
    let result = items[key]
    if (result === undefined) {
      result = handler(key)
      if (count === max) {
        for (const key in items) {
          delete items[key]
          break
        }
      } else {
        count += 1
      }
    } else {
      delete items[key]
    }
    items[key] = result
    return result
  }
}

const cache: {
  [separator: string]: (key: string) => string
} = {}

export function slugify (str: string, separator: string = '-'): string {
  let bySeparator = cache[separator]
  if (bySeparator === undefined) {
    bySeparator = LRUCache((key: string) => slugifyRaw(key, separator))
    cache[separator] = bySeparator
  }
  return bySeparator(str)
}
