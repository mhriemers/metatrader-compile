import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import {promises as fs} from 'fs'
import * as util from 'util'
import * as path from 'path'
import {glob} from 'glob'

const g = util.promisify(glob)

export interface CompilationResult {
  errors: number
  warnings: number
}

async function getPath(names: string[], errorName: string): Promise<string> {
  return Promise.any(names.map(name => io.which(name, true))).catch(() => {
    throw new Error(`${errorName} binary not found!`)
  })
}

async function getMetaEditorPath(): Promise<string> {
  return getPath(['metaeditor', 'metaeditor64'], 'MetaEditor')
}

export async function compileFile(
  file: string,
  include?: string
): Promise<CompilationResult> {
  const metaEditorPath = await getMetaEditorPath()

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

  const regex =
    /[Rr]esult:? (?<errors>\d+) errors, (?<warnings>\d+) warnings/
  let matches = log.match(regex)

  if (!matches) throw new Error('RegEx error, no matches!')
  if (!matches.groups) throw new Error('RegEx error, no groups!')

  const result = {
    errors: parseInt(matches.groups.errors),
    warnings: parseInt(matches.groups.warnings)
  }

  // Remove log file
  await io.rmRF(logPath)

  return result
}

export async function compileDirectory(
  dir: string,
  include?: string
): Promise<Map<string, CompilationResult>> {
  const files = await g(`${dir}/**/*.mq{4,5}`)
  const res = new Map<string, CompilationResult>()
  for (const file of files) {
    const result = await compileFile(file, include)
    res.set(file, result)
  }

  return res
}
