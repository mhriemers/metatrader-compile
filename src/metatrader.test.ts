import * as metatrader from './metatrader'

describe('metaeditor compilation', () => {
  test('it compiles Test1.mq4 successfully on MetaTrader 4', async () => {
    const res = await metatrader.compileFile('.ci/Test1.mq4')

    if (process.env.METATRADER_VERSION == '4') {
      expect(res.errors).toBe(0)
      expect(res.warnings).toBe(1)
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res.errors).toBe(1)
      expect(res.warnings).toBe(1)
    }
  })

  test('it compiles Test2.mq5 successfully on MetaTrader 5', async () => {
    const res = await metatrader.compileFile('.ci/Test2.mq5')

    if (process.env.METATRADER_VERSION == '4') {
      expect(res.errors).toBe(1)
      expect(res.warnings).toBe(1)
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res.errors).toBe(0)
      expect(res.warnings).toBe(1)
    }
  })

  test('it does not compile Test3.mq4 on both version', async () => {
    const res = await metatrader.compileFile('.ci/Test3.mq4')

    if (process.env.METATRADER_VERSION == '4') {
      expect(res.errors).toBe(1)
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res.errors).toBe(2)
    }

    expect(res.warnings).toBe(0)
  })

  test('it does not compile Test4.mq5 on both version', async () => {
    const res = await metatrader.compileFile('.ci/Test4.mq5')

    if (process.env.METATRADER_VERSION == '4') {
      expect(res.errors).toBe(2)
    }

    if (process.env.METATRADER_VERSION == '5') {
      expect(res.errors).toBe(1)
    }

    expect(res.warnings).toBe(0)
  })
})
