const github = require('@actions/github')

async function listCommits(token) {
  console.log('Listing commits...')

  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo
  const pull_number = github.context.payload.number

  return await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number
  })
}

module.exports = {
  listCommits
}
