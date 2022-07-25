import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import { promises as fs } from 'fs'
import * as util from 'util'
import * as path from 'path'
import { glob } from 'glob'

const g = util.promisify(glob)

export interface CommandOptions {
  file?: string
  directory?: string
  include?: string
}

export async function execCommand(cmd: string, options: CommandOptions): Promise<void> {
  switch (cmd) {
    case 'compile':
      return compile(options)
  }
}

async function getPath(names: string[], errorName: string): Promise<string> {
  return Promise.any(
    names.map(name => {
      return io.which(name, true)
    })
  ).catch(() => {
    throw new Error(`${errorName} binary not found!`)
  })
}

async function getMetaEditorPath(): Promise<string> {
  return getPath(['metaeditor', 'metaeditor64'], 'MetaEditor')
}

async function compileFile(file: string, include?: string): Promise<void> {
  const metaEditorPath = await getMetaEditorPath()

  const args = ['/log', `/compile:${file}`]
  if (include) {
    args.push(`/inc:${include}`)
  }

  // Make sure any existing log files are removed
  const fileParsed = path.parse(file)
  const logPath = path.join(fileParsed.dir, `${fileParsed.name}.log`)
  await io.rmRF(logPath)

  exec.exec(`"${metaEditorPath}"`, args)

  const log = (await fs.readFile(logPath)).toString()
  core.info(log)
}

async function compileDirectory(dir: string, include?: string): Promise<void> {
  const files = await g(`${dir}/**/*.mq{4,5}`)
  files.forEach(async file => {
    // Compile files in sync, need to test if parallel compilation is possible
    await compileFile(file, include)
  })
}

async function compile(options: CommandOptions): Promise<void> {
  if (options.file && options.directory) {
    throw new Error('File and directory cannot both be specified!')
  }

  if (options.file) {
    return compileFile(options.file, options.include)
  }

  if (options.directory) {
    return compileDirectory(options.directory, options.include)
  }

  throw new Error('No file or directory specified!')
}