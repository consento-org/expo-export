import { expoExport } from './expo-export'

export default function (context: any): void {
  expoExport({
    color: true,
    font: false,
    textStyle: false,
    assets: false,
    components: false
  }, context)
}
