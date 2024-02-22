import { context } from 'src/context'

import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import * as plugin from '@octokit/plugin-rest-endpoint-methods'

export const listCommits = async (): Promise<
  plugin.RestEndpointMethodTypes['pulls']['listCommits']['response']['data']
> => {
  const { owner, repo, pullNumber, token } = context
  const octokit = getOctokit(token)

  core.debug(
    `Listing commits for owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}`
  )

  const allCommits = []
  let res
  let page = 0

  do {
    // FIXME
    core.info(`Page: ${page}`)

    res = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 5,
      page
    })

    allCommits.push(...res.data)
    page++
  } while (res.data.length)

  if (!allCommits.length) {
    throw new Error(
      `No commits found for owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}`
    )
  }

  core.info(`****** allCommits: ${JSON.stringify(allCommits)} ******`)

  // Start from the most recent commit
  return allCommits.reverse()
}
