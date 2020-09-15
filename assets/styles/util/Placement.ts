import { ViewStyle, FlexStyle } from 'react-native'
import { ISize, IPlacement, RenderGravity } from './types'

const placeCache: WeakMap<ISize, Placement> = new WeakMap<ISize, Placement>()

export function getPlace (size: ISize): Placement {
  let place = placeCache.get(size)
  if (place === undefined) {
    place = new Placement({ x: 0, y: 0, w: size.width, h: size.height, r: 0, b: 0 })
    placeCache.set(size, place)
  }
  return place
}

export type IHorzLeft = Pick<ViewStyle, 'left' | 'width'>
export type IHorzRight = Pick<ViewStyle, 'right' | 'width'>
export type IHorz = IHorzLeft & IHorzRight
export type IVertTop = Pick<ViewStyle, 'top' | 'height'>
export type IVertBottom = Pick<ViewStyle, 'bottom' | 'height'>
export type IVert = IVertTop & IVertBottom

class Horz {
  private readonly place: Placement

  constructor (place: Placement) {
    this.place = place
  }

  render <TStyle extends IHorz = IHorz>(gravity: RenderGravity, size: ISize, style?: TStyle): TStyle {
    if (gravity === 'start') {
      return this.start(style)
    }
    if (gravity === 'stretch') {
      return this.stretch(size, style)
    }
    if (gravity === 'center') {
      return this.center(size, style)
    }
    if (gravity === 'end') {
      return this.end(style)
    }
    const s: TStyle = style ?? ({} as any)
    s.width = this.place.width
    return s
  }

  start <TStyle extends IHorzLeft = IHorzLeft>(style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.left = this.place.left
    s.width = this.place.width
    return s
  }

  stretch <TStyle extends IHorzLeft = IHorzLeft>(size: ISize, style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.left = this.place.left
    s.width = size.width - this.place.right - this.place.left
    return s
  }

  center <TStyle extends IHorzLeft = IHorzLeft>(size: ISize, style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.left = this.place.left - this.place.centerX + (size.width - this.place.left) / 2
    s.width = size.width
    return s
  }

  end <TStyle extends IHorzRight = IHorzRight>(style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.right = this.place.right
    s.width = this.place.width
    return s
  }
}

class Vert {
  private readonly place: Placement

  constructor (place: Placement) {
    this.place = place
  }

  render <TStyle extends IVert = IVert>(gravity: RenderGravity, size: ISize, style?: TStyle): TStyle {
    if (gravity === 'start') {
      return this.start(style)
    }
    if (gravity === 'stretch') {
      return this.stretch(size, style)
    }
    if (gravity === 'center') {
      return this.center(size, style)
    }
    if (gravity === 'end') {
      return this.end(style)
    }
    const s: TStyle = style ?? ({} as any)
    s.height = this.place.height
    return s
  }

  start <TStyle extends IVertTop = IVertTop>(style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.top = this.place.top
    s.height = this.place.height
    return s
  }

  stretch <TStyle extends IVertTop = IVertTop>(size: ISize, style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.top = this.place.top
    s.height = size.height - this.place.bottom - this.place.top
    return s
  }

  center <TStyle extends IVertTop = IVertTop>(size: ISize, style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.top = this.place.top - this.place.centerY + (size.height - this.place.top) / 2
    s.height = size.height
    return s
  }

  end <TStyle extends IVertBottom = IVertBottom>(style?: TStyle): TStyle {
    const s: TStyle = style ?? ({} as any)
    s.bottom = this.place.bottom
    s.height = this.place.height
    return s
  }
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

  private _horz: Horz | undefined
  private _vert: Vert | undefined

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
    this.right = r ?? 0
    this.bottom = b ?? 0
    this.centerX = x + w / 2
    this.centerY = y + h / 2
  }

  toJSON (): IPlacement {
    return { x: this.x, y: this.y, w: this.width, h: this.height, r: this.right, b: this.bottom }
  }

  get horz (): Horz {
    if (this._horz === undefined) {
      this._horz = new Horz(this)
    }
    return this._horz
  }

  get vert (): Vert {
    if (this._vert === undefined) {
      this._vert = new Vert(this)
    }
    return this._vert
  }

  size<T extends Pick<FlexStyle, 'width' | 'height'>>(style?: T): T {
    style = (style ?? {}) as T
    style.width = this.width
    style.height = this.height
    return style
  }

  style<T extends Pick<FlexStyle, 'width' | 'height' | 'top' | 'left'>>(style?: T): T {
    style = this.size(style)
    style.top = this.top
    style.left = this.left
    return style
  }

  spaceBetween (other: Placement): { x: number, y: number } {
    return {
      x: this.spaceX(other),
      y: this.spaceY(other)
    }
  }

  spaceY (other: Placement): number {
    if (this.y > other.y) {
      return other.spaceY(this)
    }
    return other.top - this.bottom
  }

  spaceX (other: Placement): number {
    if (this.x > other.x) {
      return other.spaceX(this)
    }
    return other.x - this.right
  }
}
