import { context } from 'src/context'

import * as core from '@actions/core'
import { getOctokit } from '@actions/github'

const allChecksPassed = async (ref: string): Promise<boolean> => {
  const { owner, repo, token } = context
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

  // TODO: Add job's name check
  // checkRun.name === specifiedJobName

  return res.data.check_runs.every(
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
