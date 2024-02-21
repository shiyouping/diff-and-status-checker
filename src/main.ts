import { allChecksPassed } from 'src/check'
import { listCommits } from 'src/commit'
import { hasDiff } from 'src/diff'

import * as core from '@actions/core'
import { context } from '@actions/github'

const checkEvent = (eventName: string): void => {
  core.debug(`Triggered eventName: ${eventName}`)

  const pullRequestEvents = [
    'pull_request',
    'pull_request_review',
    'pull_request_review_comment',
    'pull_request_target'
  ]

  if (!pullRequestEvents.includes(eventName)) {
    throw new Error(`${eventName} is not a valid event.`)
  }
}

const getFilters = (raw: string): string[] => {
  const filters = raw.split('\n').filter(filter => filter.trim() !== '')
  core.debug(`Filters: ${filters}`)
  return filters
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export const run = async (): Promise<void> => {
  checkEvent(context.eventName)

  const baseBranch = context.payload.pull_request?.base?.ref
  core.debug(`Base branch: ${baseBranch}`)

  const currentBranch = context.payload.pull_request?.head?.ref
  core.debug(`Current branch: ${currentBranch}`)

  try {
    const token = core.getInput('token', { required: false })
    const filters = getFilters(core.getInput('filters', { required: false }))

    const commits = await listCommits(token)

    // Start from the most recent commit
    commits.reverse()
    const latestCommitSha = commits[0].sha
    let latestPassedCommitSha: string | undefined = undefined

    for (const commit of commits) {
      const allPassed = await allChecksPassed(commit.sha, token)
      core.info(`Commit ${commit.sha} has all checks passed: ${allPassed}`)

      if (allPassed) {
        // This is the most recent commit that passed all checks
        latestPassedCommitSha = commit.sha
        break
      }
    }

    let hasChanges: boolean

    if (!latestPassedCommitSha) {
      core.info('No passed checks detected in the past')
      hasChanges = await hasDiff(baseBranch, currentBranch, filters)
      core.info(
        `Diff between ${baseBranch} and ${currentBranch}: ${hasChanges}`
      )

      core.setOutput('hasDiff', hasChanges ? 'true' : 'false')
      return
    }

    hasChanges = await hasDiff(latestPassedCommitSha, latestCommitSha, filters)
    core.info(
      `Diff between ${latestPassedCommitSha} and ${latestCommitSha}: ${hasChanges}`
    )
    core.setOutput('hasDiff', 'true')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
