export function createCache<TType> (): (key: string, load: () => TType) => () => TType {
  const cache: { [key: string]: TType } = {}
  return (key, load) => {
    return () => {
      let result = cache[key]
      if (result === undefined) {
        // eslint-disable-next-line new-cap
        result = load()
        cache[key] = result
      }
      return result
    }
  }
}
