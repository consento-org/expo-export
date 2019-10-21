import { expoExport } from './expo-export'

export default function (context: any): void {
  expoExport({
    color: false,
    font: true,
    textStyle: false,
    assets: false
  }, context)
}
