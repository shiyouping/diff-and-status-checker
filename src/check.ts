import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'

export const allChecksPassed = async (
  ref: string,
  token: string
): Promise<boolean> => {
  const octokit = getOctokit(token)
  const { owner, repo } = context.repo

  core.debug(
    `Getting checks for owner: ${owner}, repo: ${repo} and ref: ${ref}`
  )
  const res = await octokit.rest.checks.listForRef({ owner, repo, ref })

  if (!res?.data?.check_runs?.length) {
    // No checks for this ref
    core.debug(`No checks for owner: ${owner}, repo: ${repo} and ref: ${ref}`)
    return false
  }

  return res.data.check_runs.every(
    checkRun =>
      checkRun.conclusion === 'success' ||
      checkRun.conclusion === 'neutral' ||
      checkRun.conclusion === 'skipped'
  )
}
