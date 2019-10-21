export function toMaxDecimals (num: number | string, maxDecimalPlaces: number): number {
  const val = typeof num === 'string' ? parseFloat(num) : num
  const exp = Math.pow(10, maxDecimalPlaces)
  return ((val * exp) | 0) / exp
}
