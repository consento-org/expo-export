import { Imports, addImport, renderImports } from '../render'

it('renderImports', () => {
  const imports: Imports = {}
  addImport(imports, './a/test/data/x', 'A')
  addImport(imports, './a/test/data/x', ['B', 'C'])
  addImport(imports, './a/test/data/b/y', 'Y')
  addImport(imports, './a/test/r', 'R')
  addImport(imports, './a/t', 'T')
  addImport(imports, './s', 'S')
  addImport(imports, 'zz', 'Top')

  expect(renderImports(imports, 'a/test')).toBe(`import { A, B, C } from './data/x'
import { Y } from './data/b/y'
import { R } from './r'
import { T } from '../t'
import { S } from '../../s'
import { Top } from 'zz'`)
})
