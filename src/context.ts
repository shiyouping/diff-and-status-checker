import * as core from "@actions/core";
import * as github from "@actions/github";

const parseArray = (raw = ""): string[] => {
  // Delimited by comma or in a new line
  const filtered = raw.split(/[,\n]+/).filter(item => item.trim() !== "");
  core.debug(`Parsed array: ${JSON.stringify(filtered)}`);
  return filtered;
};

export type Context = {
  eventName: string;
  pullNumber: number;
  owner: string;
  repo: string;
  baseSha: string;
  headSha: string;
  token: string;
  filters: string[];
  includeJobs: string[];
  excludeJobs: string[];
};

const context: Context = {
  eventName: github.context.eventName,
  baseSha: github.context.payload.pull_request?.base?.sha,
  headSha: github.context.payload.pull_request?.head?.sha,
  pullNumber: github.context.payload.number,
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  token: core.getInput("token", { required: false }),
  filters: parseArray(core.getInput("filters", { required: false })),
  includeJobs: parseArray(core.getInput("includeJobs", { required: false })),
  excludeJobs: parseArray(core.getInput("excludeJobs", { required: false }))
} as const;

core.info(`Context: ${JSON.stringify(context)}`);

export { context };
