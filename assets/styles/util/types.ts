export interface ISize {
  width: number
  height: number
}

export interface ILayer extends ISize {
  name: string
  backgroundColor?: string | undefined
}
