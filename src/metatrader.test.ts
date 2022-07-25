import * as metatrader from './metatrader'

describe('metaeditor compilation', () => {
    test('it compiles Test1.mq4 succesfully', async () => {
        await metatrader.execCommand('compile', {
            file: '.ci/Test1.mq4'
        })
    })

    test('it compiles Test2.mq5 succesfully', async () => {
        await metatrader.execCommand('compile', {
            file: '.ci/Test2.mq5'
        })
    })
})