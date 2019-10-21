export interface Node<T> {
  item?: T
  children: Hierarchy<T>
}
export interface Hierarchy<T> { [key: string]: Node<T> }
