import { allChecksPassed } from 'src/check'
import { listCommits } from 'src/commit'
import { context } from 'src/context'
import { hasDiff } from 'src/diff'

import * as core from '@actions/core'

const checkEvent = (eventName: string): void => {
  const validEvents = [
    'pull_request',
    'pull_request_review',
    'pull_request_review_comment',
    'pull_request_target'
  ]

  if (!validEvents.includes(eventName)) {
    throw new Error(`${eventName} is not a valid event.`)
  }
}

const writeOutput = (hasDiff: boolean): void => {
  const result = hasDiff ? 'true' : 'false'
  core.setOutput('hasDiff', result)
  core.info(`Wrote output. hasDiff: ${result}`)
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export const run = async (): Promise<void> => {
  const { baseSha, headSha, eventName, filters } = context
  checkEvent(eventName)

  try {
    const commits = await listCommits()

    // Start from the most recent commit
    commits.reverse()
    let latestPassedCommitSha: string | undefined

    for (const commit of commits) {
      const allPassed = await allChecksPassed(commit.sha)
      core.info(`Commit ${commit.sha} has all checks passed: ${allPassed}`)

      if (allPassed) {
        // This is the most recent commit that passed all checks
        latestPassedCommitSha = commit.sha
        break
      }
    }

    let hasChanges: boolean

    if (!latestPassedCommitSha) {
      core.info('No commits that passed checks detected in the past')
      hasChanges = await hasDiff(baseSha, headSha, filters)
      writeOutput(hasChanges)
      return
    }

    core.info('Commit that passed checks detected')
    hasChanges = await hasDiff(latestPassedCommitSha, headSha, filters)
    writeOutput(hasChanges)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
