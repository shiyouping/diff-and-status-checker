import { context, getOctokit } from '@actions/github'

export const allChecksPassed = async (
  ref: string,
  token: string
): Promise<boolean> => {
  const octokit = getOctokit(token)
  const { owner, repo } = context.repo

  const res = await octokit.rest.checks.listForRef({ owner, repo, ref })
  if (!res?.data?.check_runs?.length) {
    // No checks for this ref
    return false
  }

  console.log('check ********************************')
  console.log(JSON.stringify(res))

  return false
}
