import { context } from 'src/context'

import * as core from '@actions/core'
import { getOctokit } from '@actions/github'

const checkJobs = (includeJobs: string[], excludeJobs: string[]): void => {
  if (includeJobs.length > 0 && excludeJobs.length > 0) {
    throw new Error('Can not have both includeJobs and excludeJobs')
  }
}

const allChecksPassed = async (ref: string): Promise<boolean> => {
  const { owner, repo, token, includeJobs, excludeJobs } = context
  checkJobs(includeJobs, excludeJobs)

  const octokit = getOctokit(token)

  core.debug(
    `Getting checks for owner: ${owner}, repo: ${repo} and ref: ${ref}`
  )
  const res = await octokit.rest.checks.listForRef({ owner, repo, ref })

  if (!res?.data?.check_runs?.length) {
    // No checks for this ref
    core.debug(`No checks for owner: ${owner}, repo: ${repo} and ref: ${ref}`)
    return false
  }

  let checkRuns = res.data.check_runs

  if (includeJobs.length) {
    const tmp = checkRuns.filter(checkRun =>
      includeJobs.includes(checkRun.name)
    )

    if (!tmp.length) {
      core.info('No check has a job specified by includeJobs')
      return false
    }

    checkRuns = tmp
  }

  if (excludeJobs.length) {
    const tmp = checkRuns.filter(
      checkRun => !excludeJobs.includes(checkRun.name)
    )

    if (!tmp.length) {
      core.info('All checks are excluded by excludeJobs')
      return true
    }

    checkRuns = tmp
  }

  return checkRuns.every(
    checkRun =>
      checkRun.conclusion === 'neutral' ||
      checkRun.conclusion === 'success' ||
      checkRun.conclusion === 'skipped'
  )
}

export const findLastChecksPassedSha = async (
  shas: string[],
  defaultSha: string
): Promise<string> => {
  for (const sha of shas) {
    const allPassed = await allChecksPassed(sha)
    core.info(`Commit ${sha} has all checks passed: ${allPassed}`)

    if (allPassed) {
      // This is the most recent commit that passed all checks
      return sha
    }
  }

  return defaultSha
}
