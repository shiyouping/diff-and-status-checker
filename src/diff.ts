import * as core from '@actions/core'
import { getExecOutput } from '@actions/exec'

const executeCommand = async (
  command: string,
  args: string[]
): Promise<string> => {
  core.startGroup(`Execute command: ${command}`)
  let output = ''

  try {
    core.info(`Command: ${command}, args: ${JSON.stringify(args)}`)
    output = (await getExecOutput(command, args)).stdout
  } finally {
    core.info('')
    core.endGroup()
  }

  core.info(`Execution output: ${output}`)
  return output
}

export const hasDiff = async (
  baseRef: string,
  headRef: string,
  filter: string[]
): Promise<boolean> => {
  await executeCommand('git', [
    'diff',
    '--no-renames',
    '--name-status',
    '-z',
    `${baseRef}..${headRef}`
  ])

  return true
}
