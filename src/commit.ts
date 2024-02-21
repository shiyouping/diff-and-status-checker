import { context, getOctokit } from '@actions/github'
import * as octokitPlugin from '@octokit/plugin-rest-endpoint-methods'

export const listCommits = async (
  token: string
): Promise<
  octokitPlugin.RestEndpointMethodTypes['pulls']['listCommits']['response']['data']
> => {
  const octokit = getOctokit(token)
  const { owner, repo } = context.repo
  const pull_number = context.payload.number

  const res = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number
  })

  if (!res?.data?.length) {
    throw new Error(
      `No commits found for owner=${owner}, repo=${repo}, pull_number=${pull_number}`
    )
  }

  return res.data
}
