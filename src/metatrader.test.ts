import * as metatrader from './metatrader'

const metatraderTest = (version: number) => {
  if (process.env.METATRADER_VERSION == version.toString()) {
    return test
  } else {
    return test.failing
  }
}

describe('metaeditor compilation', () => {
  metatraderTest(4)('it compiles Test1.mq4 succesfully', async () => {
    await expect(
      metatrader.execCommand('compile', {
        file: '.ci/Test1.mq4'
      })
    ).resolves.toBe(undefined)
  })

  metatraderTest(5)('it compiles Test2.mq5 succesfully', async () => {
    await expect(
      metatrader.execCommand('compile', {
        file: '.ci/Test2.mq5'
      })
    ).resolves.toBe(undefined)
  })

  test('it does not compile Test3.mq4', async () => {
    await expect(
      metatrader.execCommand('compile', {
        file: '.ci/Test3.mq4'
      })
    ).rejects.toThrow()
  })

  test('it does not compile Test4.mq5', async () => {
    await expect(
      metatrader.execCommand('compile', {
        file: '.ci/Test4.mq5'
      })
    ).rejects.toThrow()
  })
})
