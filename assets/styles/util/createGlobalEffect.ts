import { useState, useEffect } from 'react'

export function createGlobalEffect <T> ({ update, init }: {
  update: () => T | undefined
  init: (handler: () => any) => () => any
}): () => T {
  const listeners = new Set<(lastUpdate: number) => any>()
  let output: T = update()
  let globalLastUpdate: number
  function updateOutput (): void {
    const newOutput = update()
    if (newOutput === undefined) {
      return
    }
    output = newOutput
    globalLastUpdate = Date.now()
    for (const update of listeners) {
      update(globalLastUpdate)
    }
  }
  let exit: () => any
  return () => {
    const setLastUpdate = useState<number>(globalLastUpdate)[1]
    useEffect(() => {
      listeners.add(setLastUpdate)
      if (listeners.size === 1) {
        exit = init(updateOutput)
      }
      return () => {
        listeners.delete(setLastUpdate)
        if (listeners.size === 0) {
          exit()
        }
      }
    }, [false]) // Only update the effect once
    return output
  }
}
