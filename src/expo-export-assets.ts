import { expoExport } from './expo-export'

export default function (context: any): void {
  expoExport({
    color: false,
    font: false,
    textStyle: false,
    assets: false
  }, context)
}
