import * as core from '@actions/core'
import * as github from '@actions/github'

const getFilters = (raw: string): string[] => {
  const filters = raw.split('\n').filter(filter => filter.trim() !== '')
  core.debug(`Filters: ${JSON.stringify(filters)}`)
  return filters
}

export type Context = {
  eventName: string
  pullNumber: number
  owner: string
  repo: string
  baseSha: string
  headSha: string
  token: string
  filters: string[]
}

const context: Context = {
  eventName: github.context.eventName,
  baseSha: github.context.payload.pull_request?.base?.sha,
  headSha: github.context.payload.pull_request?.head?.sha,
  pullNumber: github.context.payload.number,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  token: core.getInput('token', { required: false }),
  filters: getFilters(core.getInput('filters', { required: false }))
} as const

core.info(`Context: ${JSON.stringify(context)}`)

export { context }
