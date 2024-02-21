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
  core.debug(`Filters: ${JSON.stringify(filters)}`)
  return filters
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
  checkEvent(context.eventName)

  const baseBranch = context.payload.pull_request?.base?.ref
  core.debug(`Base branch: ${baseBranch}`)

  const baseSha = context.payload.pull_request?.base?.sha
  core.debug(`Base SHA: ${baseSha}`)

  const headBranch = context.payload.pull_request?.head?.ref
  core.debug(`headBranch branch: ${headBranch}`)

  const headSha = context.payload.pull_request?.head?.sha
  core.debug(`headSha branch: ${headSha}`)

  try {
    const token = core.getInput('token', { required: false })
    const filters = getFilters(core.getInput('filters', { required: false }))

    const commits = await listCommits(token)

    // Start from the most recent commit
    commits.reverse()
    let latestPassedCommitSha: string | undefined = undefined

    for (const commit of commits) {
      const allPassed = await allChecksPassed(commit.sha, token)
      core.debug(`Commit ${commit.sha} has all checks passed: ${allPassed}`)

      if (allPassed) {
        // This is the most recent commit that passed all checks
        latestPassedCommitSha = commit.sha
        break
      }
    }

    let hasChanges: boolean

    if (!latestPassedCommitSha) {
      core.info('No passed checks detected in the past')

      hasChanges = await hasDiff(baseSha, headSha, filters)
      core.info(`Diff between ${baseSha} and ${headSha}: ${hasChanges}`)

      writeOutput(hasChanges)
      return
    }

    hasChanges = await hasDiff(latestPassedCommitSha, headSha, filters)
    core.info(
      `Diff between ${latestPassedCommitSha} and ${headSha}: ${hasChanges}`
    )

    writeOutput(hasChanges)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
