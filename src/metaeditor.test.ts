import {compileFiles} from './metaeditor'
import * as path from 'path'

describe('metaeditor compilation', () => {
  test('it compiles Test1.mq4 successfully on MetaTrader 4', async () => {
    const res = await compileFiles('.ci/Test1.mq4')

    expect(res.length).toBe(1)

    if (process.env.METATRADER_VERSION == '4') {
      expect(res[0].errors).toBe(0)
      expect(res[0].warnings).toBe(1)
      expect(res[0].output).toBe(path.join(process.cwd(), '.ci/Test1.ex4'))
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res[0].errors).toBe(1)
      expect(res[0].warnings).toBe(1)
    }
  })

  test('it compiles Test2.mq5 successfully on MetaTrader 5', async () => {
    const res = await compileFiles('.ci/Test2.mq5')

    expect(res.length).toBe(1)

    if (process.env.METATRADER_VERSION == '4') {
      expect(res[0].errors).toBe(1)
      expect(res[0].warnings).toBe(1)
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res[0].errors).toBe(0)
      expect(res[0].warnings).toBe(1)
      expect(res[0].output).toBe(path.join(process.cwd(), '.ci/Test2.ex5'))
    }
  })

  test('it does not compile Test3.mq4 on both version', async () => {
    const res = await compileFiles('.ci/Test3.mq4')

    expect(res.length).toBe(1)

    if (process.env.METATRADER_VERSION == '4') {
      expect(res[0].errors).toBe(1)
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res[0].errors).toBe(2)
    }

    expect(res[0].warnings).toBe(0)
  })

  test('it does not compile Test4.mq5 on both version', async () => {
    const res = await compileFiles('.ci/Test4.mq5')

    expect(res.length).toBe(1)

    if (process.env.METATRADER_VERSION == '4') {
      expect(res[0].errors).toBe(2)
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res[0].errors).toBe(1)
    }

    expect(res[0].warnings).toBe(0)
  })
})
