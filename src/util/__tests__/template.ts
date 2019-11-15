import { template, replace } from '../template'

describe('empty', () => {
  it('no template, simple passthrough', () => {
    expect(template('hello', {})).toBe('hello')
  })
})

describe('blocks', () => {
  it('remove block', () => {
    expect(template(`-->
// ^fancy
Hello World
// $fancy
<--`, {
      blocks: {
        fancy (found) {
          expect(found).toBe('Hello World\n')
          return ''
        }
      }
    })).toBe('-->\n<--')
  })
  it('Blocks with identation', () => {
    expect(template(`-->
  // ^fancy
  Hello World
  // $fancy
<--`, {
      blocks: {
        fancy (found) {
          expect(found).toBe('  Hello World\n')
          return ''
        }
      }
    })).toBe('-->\n<--')
  })
  it('keep the block', () => {
    expect(template(`-->
// ^fancy
Hello World
// $fancy
<--`, {
      blocks: {
        fancy: input => input
      }
    })).toBe('-->\nHello World\n<--')
  })
  it('replace one block', () => {
    expect(template(`-->
// ^fancy
Hello World
// $fancy
<--`, {
      blocks: {
        fancy (_) {
          return 'This\nis\nreplaced!\n'
        }
      }
    })).toBe('-->\nThis\nis\nreplaced!\n<--')
  })
})
describe('lines', () => {
  it('remove line', () => {
    expect(template(`-->
Hello World // !!!ignore
<--`, {
      lines: {
        ignore (data) {
          expect(data).toBe('Hello World\n')
          return ''
        }
      }
    })).toBe('-->\n<--')
  })
  it('keep first of two lines', () => {
    expect(template(`-->
Hello World // !!!a
Hallo Welt // !!!b
<--`, {
      lines: {
        a (data) {
          return data
        },
        b (_) {
          return ''
        }
      }
    })).toBe('-->\nHello World\n<--')
  })
  it('replace line', () => {
    expect(template(`-->
Hello World // !!!fancy
<--`, {
      lines: {
        fancy (_) {
          return 'Standard\n'
        }
      }
    })).toBe('-->\nStandard\n<--')
  })
  it('remove multiple lines', () => {
    expect(template(`-->
Hello World // !!!ignore
more
Something else // !!!ignore
<--`, {
      lines: {
        ignore (_) {
          return ''
        }
      }
    })).toBe('-->\nmore\n<--')
  })
})

describe('replace', () => {
  it('string replacement', () => {
    expect(replace('\'Hello $xsan\'', {
      x: 'Martin-'
    })).toBe('\'Hello Martin-san\'')
  })
  it('number replacement', () => {
    expect(replace('\'ABC...\' + Number($x)...', {
      x: 123
    })).toBe('\'ABC...\' + 123...')
  })
})
