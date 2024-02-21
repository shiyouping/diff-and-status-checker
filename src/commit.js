const github = require('@actions/github')

async function listCommits(token) {
  console.log('Listing commits...')

  const octokit = github.getOctokit(token)
  const { owner, repo, pull_number } = github.context.issue

  console.log('*********************************')
  console.log('Printing github.context...')
  console.log(JSON.stringify(github.context))

  console.log('*********************************')
  console.log('Printing github.event...')
  console.log(JSON.stringify(github.event))

  return await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number
  })
}

module.exports = {
  listCommits
}
