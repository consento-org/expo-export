export type TAlignment = 'center' | 'right' | 'left' | 'justified'

export interface ITextFormat {
  id?: string
  fontFamily?: string
  fontSize?: number
  color?: string
  lineHeight?: number
  textTransform?: string
  textAlign?: TAlignment
}

const DEFAULT_FONTSIZE = 12
const DEFAULT_LINEHEIGHT_FACTOR = 1.2
const DEFAULT_TEXT_COLOR = '#000'
const DEFAULT_FONTFAMILY = ''
const DEFAULT_TEXT_ALIGN = 'left'
const DEFAULT_TEXT_TRANSFORM = 'none'

export class TextFormat implements ITextFormat {
  public fontFamily: string
  public fontSize: number
  public color: string
  public lineHeight: number
  public textTransform: string
  public textAlign: TAlignment
  public id: string

  constructor ({ id, fontFamily, fontSize, color, lineHeight, textTransform, textAlign }: ITextFormat) {
    this.id = id
    this.fontFamily = fontFamily !== undefined ? fontFamily : DEFAULT_FONTFAMILY
    this.fontSize = fontSize !== undefined ? fontSize : DEFAULT_FONTSIZE
    this.color = color !== undefined ? color : DEFAULT_TEXT_COLOR
    this.lineHeight = lineHeight !== undefined && !isNaN(lineHeight) ? lineHeight : this.fontSize * DEFAULT_LINEHEIGHT_FACTOR
    this.textTransform = textTransform !== undefined ? textTransform : DEFAULT_TEXT_TRANSFORM
    this.textAlign = textAlign !== undefined ? textAlign : DEFAULT_TEXT_ALIGN
  }
}
