export type TAlignment = 'center' | 'right' | 'left' | 'justified'
export type TVerticalAlign = 'auto' | 'top' | 'bottom' | 'center'

export interface ITextFormat {
  id?: string
  fontFamily?: string
  fontSize?: number
  color?: string
  lineHeight?: number
  textTransform?: string
  textAlign?: TAlignment
  textAlignVertical?: TVerticalAlign
}

const DEFAULT_FONTSIZE = 12
const DEFAULT_TEXT_COLOR = '#000'
const DEFAULT_FONTFAMILY = ''
const DEFAULT_TEXT_ALIGN = 'left'
const DEFAULT_TEXT_TRANSFORM = 'none'
const DEFAULT_VERTICAL_TEXT_ALIGN = 'center'

export class TextFormat implements ITextFormat {
  public fontFamily: string
  public fontSize: number
  public color: string
  public lineHeight: number
  public textTransform: string
  public textAlign: TAlignment
  public id: string
  public textAlignVertical: TVerticalAlign

  constructor ({ id, fontFamily, fontSize, color, lineHeight, textTransform, textAlign, textAlignVertical }: ITextFormat) {
    this.id = id
    this.fontFamily = fontFamily !== undefined ? fontFamily : DEFAULT_FONTFAMILY
    this.fontSize = fontSize !== undefined ? fontSize : DEFAULT_FONTSIZE
    this.color = color !== undefined ? color : DEFAULT_TEXT_COLOR
    this.lineHeight = lineHeight !== undefined && lineHeight !== null && !isNaN(lineHeight) ? lineHeight : undefined
    this.textTransform = textTransform !== undefined ? textTransform : DEFAULT_TEXT_TRANSFORM
    this.textAlign = textAlign !== undefined ? textAlign : DEFAULT_TEXT_ALIGN
    this.textAlignVertical = textAlignVertical !== undefined ? textAlignVertical : DEFAULT_VERTICAL_TEXT_ALIGN
  }
}
