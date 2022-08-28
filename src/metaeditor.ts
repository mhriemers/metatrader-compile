import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import * as glob from '@actions/glob'
import {constants, promises as fs} from 'fs'
import * as path from 'path'

export interface CompilationResult {
  errors: number
  warnings: number
  input: string
  output?: string
}

async function getPath(): Promise<string> {
  if (process.env.MT_EDITOR_PATH) {
    core.info(`Found $MT_EDITOR_PATH: ${process.env.MT_EDITOR_PATH}`)
    return process.env.MT_EDITOR_PATH
  } else {
    core.info(`$MT_EDITOR_PATH not found, falling back to path resolution.`)
    return Promise.any(
      ['metaeditor', 'metaeditor64'].map(name => io.which(name, true))
    ).catch(() => {
      throw new Error('MetaEditor binary not found!')
    })
  }
}

async function checkExecutable(metaEditorPath: string): Promise<any> {
  return fs.access(metaEditorPath, constants.X_OK)
}

async function compileFile(
  file: string,
  include?: string
): Promise<CompilationResult> {
  const metaEditorPath = await getPath()
  await checkExecutable(metaEditorPath)

  const args = ['/log', `/compile:${file}`]
  if (include) {
    args.push(`/inc:${include}`)
  }

  // Make sure any existing log files are removed
  const fileParsed = path.parse(file)
  const logPath = path.join(fileParsed.dir, `${fileParsed.name}.log`)
  await io.rmRF(logPath)

  await exec.exec(`"${metaEditorPath}"`, args, {
    ignoreReturnCode: true
  })
  const logBuffer = await fs.readFile(logPath)
  const log = logBuffer.toString('utf16le')
  core.info(log)

  const regex = /[Rr]esult:? (?<errors>\d+) errors, (?<warnings>\d+) warnings/
  const matches = log.match(regex)

  if (!matches) throw new Error('RegEx error, no matches!')
  if (!matches.groups) throw new Error('RegEx error, no groups!')

  const result: CompilationResult = {
    errors: parseInt(matches.groups.errors),
    warnings: parseInt(matches.groups.warnings),
    input: file
  }

  const compiledExtension = `.ex${fileParsed.ext.slice(-1)}`
  const compiledPath = path.join(
    fileParsed.dir,
    `${fileParsed.name}${compiledExtension}`
  )
  try {
    await fs.access(compiledPath, constants.R_OK)
    result.output = compiledPath
  } catch (e) {
    if (result.errors == 0) {
      throw new Error('Compiled binary not available!')
    }
  }

  // Remove log file
  await io.rmRF(logPath)

  return result
}

export async function compileFiles(
  files: string,
  include?: string
): Promise<CompilationResult[]> {
  const globber = await glob.create(files)
  const results = []
  for await (const file of globber.globGenerator()) {
    const result = await compileFile(file, include)
    results.push(result)
  }

  return results
}
