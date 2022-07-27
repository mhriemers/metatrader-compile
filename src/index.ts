import * as core from '@actions/core'
import {CompilationResult, compileFiles} from './metaeditor'

export * from './metaeditor'

function formatCompilationResult(result: CompilationResult): string {
  return `errors: ${result.errors}, warnings: ${result.warnings}`
}

function printCompilationResult(result: CompilationResult): void {
  if (result.errors > 0) {
    core.info(
      `[${result.input}] Compilation successful: ${formatCompilationResult(
        result
      )}`
    )
    core.info(`[${result.input}] Binary available at: ${result.output}`)
  } else {
    core.error(
      `[${result.input}] Compilation failed: ${formatCompilationResult(result)}`
    )
  }
}

async function run() {
  const files = core.getInput('files')
  const include = core.getInput('include', {
    required: true
  })

  if (files) {
    const results = await compileFiles(files, include)
    let errors = 0
    for (const result of results) {
      errors += result.errors
      printCompilationResult(result)
    }

    if (errors > 0) {
      throw new Error(`Compilation failed with ${errors} errors!`)
    }

    core.setOutput('results', results)
  }

  throw new Error('No files specified!')
}

if (require.main === module) {
  run().catch(e => {
    core.setFailed(e)
  })
}
