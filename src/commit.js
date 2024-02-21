const github = require('@actions/github')

async function listCommits(token) {
  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo
  const pull_number = github.context.payload.number

  const res = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number
  })

  if (!res.data || res.data.length === 0) {
    throw new Error(
      `No commits found for owner=${owner}, repo=${repo}, pull_number=${pull_number}`
    )
  }

  return res.data
}

module.exports = {
  listCommits
}
