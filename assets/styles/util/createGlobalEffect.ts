import { useState, useEffect } from 'react'

type TCleanup = () => any

export function createGlobalEffect <T> ({ update, init }: {
  /**
   * Executed when the first state is used.
   *
   * @param onUpdate handler to triggere an update (i.e. when an event happens)
   * @returns Cleanup operation to be executed when no one needs this state anymore
   */
  init: (onUpdate: () => void) => TCleanup

  /**
   * Update operation executed when onUpdate method of init is triggered.
   *
   * @returns The updated state or undefined if nothing changed.
   */
  update: () => T | undefined
}): () => T | undefined {
  const listeners = new Set<(lastUpdate: number) => any>()
  let output: T | undefined = update()
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
  let cleanup: TCleanup
  return () => {
    const setLastUpdate = useState<number>(globalLastUpdate)[1]
    useEffect(() => {
      listeners.add(setLastUpdate)
      if (listeners.size === 1) {
        cleanup = init(updateOutput)
      }
      return () => {
        listeners.delete(setLastUpdate)
        if (listeners.size === 0) {
          cleanup()
        }
      }
    }, [false]) // Only update the effect once
    return output
  }
}
