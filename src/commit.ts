import { context } from 'src/context'

import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import * as plugin from '@octokit/plugin-rest-endpoint-methods'

export const listCommits = async (): Promise<
  plugin.RestEndpointMethodTypes['pulls']['listCommits']['response']['data']
> => {
  const { owner, repo, pullNumber, token } = context
  const octokit = getOctokit(token)

  // FIXME
  core.info(
    `Listing commits for owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}`
  )

  const res = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: pullNumber
  })

  if (!res?.data?.length) {
    throw new Error(
      `No commits found for owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}`
    )
  }

  // FIXME
  core.info(`******************** ${JSON.stringify(res)}`)

  return res.data
}
