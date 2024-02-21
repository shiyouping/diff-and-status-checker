const core = require('@actions/core')
const { listCommits } = require('./commit')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const token = core.getInput('token')
    const commits = await listCommits(token)

    console.log('*********************************')
    for (const commit of commits) {
      console.log('Printing commit...')
      console.log(JSON.stringify(commit))
      console.log('*********************************')
    }

    core.setOutput('hasDiff', 'true')
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
