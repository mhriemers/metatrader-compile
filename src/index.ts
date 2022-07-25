import * as core from '@actions/core'
import * as metatrader from './metatrader'

export {metatrader}

async function run() {
  const command = core.getInput('command')
  const options = {
    file: core.getInput('file'),
    directory: core.getInput('directory'),
    include: core.getInput('include')
  }
  await metatrader.execCommand(command, options)
}

if (require.main === module) {
  run().catch(e => {
    core.setFailed(e)
  })
}
