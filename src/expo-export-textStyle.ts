import { expoExport } from './expo-export'

export default function (context: any): void {
  expoExport({
    color: false,
    font: false,
    textStyle: true,
    assets: false,
    components: false
  }, context)
}
