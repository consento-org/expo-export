export class Cache<Type, Args> {
  cache: { [key: string]: Type } = {}
  clazz: new (Args) => Type

  constructor (clazz: new (Args: Args) => Type) {
    this.clazz = clazz
  }

  fetch (key: string, load: () => Args): Type {
    let result = this.cache[key]
    if (result === undefined) {
      // eslint-disable-next-line new-cap
      result = new this.clazz(load())
      this.cache[key] = result
    }
    return result
  }
}
