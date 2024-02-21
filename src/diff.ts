import * as core from '@actions/core'
import { getExecOutput } from '@actions/exec'

const getDiff = async (baseRef: string, headRef: string): Promise<string[]> => {
  core.startGroup('Getting diff...')
  let output = ''

  try {
    output = (
      await getExecOutput('git', ['diff', '--name-only', baseRef, headRef])
    ).stdout
  } finally {
    core.info('')
    core.endGroup()
  }

  core.debug(`Execution output: ${output}`)

  const diff = output.split('\n').filter(path => path.trim().length > 0)
  core.debug(`Diff: ${JSON.stringify(diff)}`)

  return diff
}

export const hasDiff = async (
  baseRef: string,
  headRef: string,
  filters: string[]
): Promise<boolean> => {
  const diff = await getDiff(baseRef, headRef)
  for (const filter of filters) {
    const included = diff.some(d => d.includes(filter))
    core.info(`Filter: ${filter} is included in diff: ${included}`)

    if (included) {
      return true
    }
  }

  return false
}
