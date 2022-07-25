import * as core from '@actions/core'
import {CompilationResult, compileFile, compileDirectory} from './metatrader'

function formatCompilationResult(res: CompilationResult): string {
  return `errors: ${res.errors}, warnings: ${res.warnings}`
}

async function run() {
  const file = core.getInput('file')
  const directory = core.getInput('directory')
  const include = core.getInput('include')

  if (file && directory) {
    throw new Error('File and directory cannot both be specified!')
  }

  if (file) {
    const result = await compileFile(file, include)
    if (result.errors > 0) {
      core.info(`Compilation successful: ${formatCompilationResult(result)}`)
    } else {
      core.setFailed(`Compilation failed: ${formatCompilationResult(result)}`)
    }
  }

  if (directory) {
    const results = await compileDirectory(directory, include)
    let errors = 0
    for (const [file, result] of results) {
      errors += result.errors
      if (result.errors > 0) {
        core.info(
          `[${file}] Compilation successful: ${formatCompilationResult(result)}`
        )
      } else {
        core.error(
          `[${file}] Compilation failed: ${formatCompilationResult(result)}`
        )
      }
    }

    if (errors > 0) {
      throw new Error(`Directory compilation failed with ${errors} errors!`)
    }
  }

  throw new Error('No file or directory specified!')
}

if (require.main === module) {
  run().catch(e => {
    core.setFailed(e)
  })
}
