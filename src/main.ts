import { allChecksPassed } from 'src/check'
import { listCommits } from 'src/commit'

import * as core from '@actions/core'
import { context } from '@actions/github'

const checkEvent = (eventName: string): void => {
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

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export const run = async (): Promise<void> => {
  checkEvent(context.eventName)

  try {
    const token = core.getInput('token')
    const commits = await listCommits(token)

    console.log('*********************************')
    console.log(JSON.stringify(commits))

    for (const commit of commits) {
      await allChecksPassed(commit.sha, token)
    }

    core.setOutput('hasDiff', 'true')
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
