import * as core from '@actions/core'
import * as io from '@actions/io'
import * as exec from '@actions/exec'
import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'

const stat = util.promisify(fs.stat)

abstract class MetaTraderAction {
  protected async getPath(names: string[], errorName: string): Promise<string> {
    return Promise.any(
      names.map(name => {
        return io.which(name, true)
      })
    ).catch(() => {
      throw new Error(`${errorName} binary not found!`)
    })
  }

  abstract exec(): Promise<void>
}

abstract class MetaTerminalAction extends MetaTraderAction {
  protected async getMetaTerminalPath(): Promise<string> {
    return this.getPath(['terminal', 'terminal64'], 'MetaEditor')
  }
}

abstract class MetaEditorAction extends MetaTraderAction {
  protected async getMetaEditorPath(): Promise<string> {
    return this.getPath(['metaeditor', 'metaeditor64'], 'MetaEditor')
  }
}

class MetaEditorCompile extends MetaEditorAction {
  async exec(): Promise<void> {
    // Can be single source file or directory
    const compile = core.getInput('compile', {
      required: true
    })
    // Optional directory to include for compilation
    const include = core.getInput('include')

    const metaEditorPath = await this.getMetaEditorPath()
    const args = ['/log', `/compile:"${compile}.mq4"`]
    if (include) {
      args.push(`/inc:"${include}"`)
    }
    exec.exec(`"${metaEditorPath}"`, args)
    const s = await stat(compile)
    if (s.isDirectory()) {
      // Get the log file from `${compile}.log`
      const log = compile + '.log'
    } else {
      // Otherwise, if it is a file, remove the extension and add `.log`
      const log = path.parse(compile).name + '.log'
    }
  }
}

class MetaEditorSyntax extends MetaEditorAction {
  exec(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

function parseCommand(command: string): MetaEditorAction {
  switch (command) {
    case 'compile':
      return new MetaEditorCompile()
    case 'syntax':
      return new MetaEditorSyntax()
    default:
      throw new Error('Unknown command!')
  }
}

async function run(): Promise<void> {
  try {
    const command = core.getInput('command', {
      required: true
    })

    const action = parseCommand(command)
    await action.exec()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
