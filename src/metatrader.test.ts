import * as metatrader from './metatrader'

describe('metaeditor compilation', () => {
    test('it compiles Test1.mq4 succesfully', async () => {
        return expect(metatrader.execCommand('compile', {
            file: '.ci/Test1.mq4'
        })).resolves
    })

    test('it compiles Test2.mq5 succesfully', async () => {
        return expect(metatrader.execCommand('compile', {
            file: '.ci/Test2.mq5'
        })).resolves
    })
})