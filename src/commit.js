const github = require('@actions/github')

async function listCommits(token) {
  const octokit = github.getOctokit(token)
  const { owner, repo, pull_number } = github.context.issue
  return await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number
  })
}

module.exports = {
  listCommits
}
