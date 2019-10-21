import { expoExport } from './expo-export'

export default function (context: any): void {
  expoExport({
    color: true,
    font: true,
    textStyle: true,
    assets: true
  }, context)
}
