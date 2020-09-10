export function exists <T> (value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isSketchError (err: any): err is ISketchError {
  if (err === null || typeof err !== 'object') {
    return false
  }
  return typeof err.error === 'string'
}

export interface ISketchError {
  error: string
}
