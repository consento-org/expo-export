// remove accents, swap ñ for n, etc
const from = 'ÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇàáäâèéëêìíïîòóöôùúüûñç·/_,:;−–\t \n\r'
const to = 'AAAAEEEEIIIIOOOOUUUUNCaaaaeeeeiiiioooouuuunc-----------'
const reg = new RegExp(`[${from}]` as any, 'g')
const map: { [ key: string ]: string } = Array.from(from).reduce((map: { [key: string]: string }, char, index) => {
  const mapped = to.charAt(index)
  map[char] = mapped !== '' ? mapped : ''
  return map
}, {})

export function slugify (str: string, separator: string = '-'): string {
  reg.lastIndex = -1
  return str
    .replace(reg, part => map[part])
    .replace(/[^a-z0-9 -]/ig, part => `x${part.charCodeAt(0).toString(16)}`) // remove invalid chars
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-|-$/g, '') // trim
    .replace(/\-/ig, separator)
}
