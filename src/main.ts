import { listCommits } from 'src/commit'

import * as core from '@actions/core'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
const run = async (): Promise<void> => {
  try {
    const token = core.getInput('token')
    const commits = await listCommits(token)

    console.log('*********************************')
    console.log(JSON.stringify(commits))

    for (const commit of commits) {
      console.log('Printing commit...')
      console.log(JSON.stringify(commit))
      console.log('*********************************')
    }

    core.setOutput('hasDiff', 'true')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

export { run }
