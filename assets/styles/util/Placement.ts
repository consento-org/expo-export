import { ISize, IPlacement } from './types'

const placeCache: WeakMap<ISize, Placement> = new WeakMap<ISize, Placement>()

export function getPlace (size: ISize): Placement {
  let place = placeCache.get(size)
  if (place === undefined) {
    place = new Placement({ x: 0, y: 0, w: size.width, h: size.height, r: 0, b: 0 })
    placeCache.set(size, place)
  }
  return place
}

export class Placement implements IPlacement {
  x: number
  y: number
  w: number
  h: number
  r: number
  b: number

  left: number
  top: number
  width: number
  height: number
  right: number
  bottom: number

  centerX: number
  centerY: number

  constructor ({ x, y, w, h, r, b }: IPlacement) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.r = r ?? 0
    this.b = b ?? 0

    this.left = x
    this.top = y
    this.width = w
    this.height = h
    this.right = this.r
    this.bottom = this.b
    this.centerX = x + w / 2
    this.centerY = y + h / 2
  }

  toJSON (): IPlacement {
    return { x: this.x, y: this.y, w: this.width, h: this.height, r: this.right, b: this.bottom }
  }

  spaceBetween (other: Placement): { x: number, y: number } {
    return {
      x: this.spaceX(other),
      y: this.spaceY(other)
    }
  }

  spaceY (other: Placement): number {
    return this.y - (other.y + other.height)
  }

  spaceX (other: Placement): number {
    return this.x - (other.x + other.width)
  }
}
