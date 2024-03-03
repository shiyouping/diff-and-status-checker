import picomatch from "picomatch";

import * as core from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { getOctokit } from "@actions/github";

const getDiff = async (baseSha: string, headSha: string): Promise<string[]> => {
  const output = (await getExecOutput("git", ["diff", "--name-only", baseSha, headSha])).stdout;
  core.debug(`Execution output: ${output}`);

  const diff = output.split("\n").filter(path => path.trim().length > 0);
  core.debug(`Diff: ${JSON.stringify(diff)}`);

  return diff;
};

const listChangedFiles = async ({
  owner,
  repo,
  pullNumber,
  token
}: {
  owner: string;
  repo: string;
  pullNumber: number;
  token: string;
}): Promise<string[]> => {
  core.debug(`Listing pull request changed files for owner: ${owner}, repo: ${repo}, pull number: ${pullNumber}`);

  const octokit = getOctokit(token);
  const responses = octokit.paginate.iterator(octokit.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100
  });

  const changedFiles = [];

  for await (const response of responses) {
    core.debug(`List changed files response: ${JSON.stringify(response)}`);

    if (response.status !== 200) {
      throw new Error(`Failed to list changed files for pull request. HTTP status code: ${response.status}`);
    }

    for (const change of response.data) {
      core.debug(`Changed file: ${JSON.stringify(change)}`);
      changedFiles.push(change.filename);
    }
  }

  core.info(`Changed files for the pull request: ${["", ...changedFiles].join("\n")}`);
  return changedFiles;
};

const isMatched = (paths: string[], patterns: string[]): boolean => {
  core.debug(`paths: ${["", ...paths].join("\n")}`);
  core.debug(`patterns: ${["", ...patterns].join("\n")}`);

  if (paths.length === 0) {
    return false;
  }

  if (paths.length > 0 && patterns.length === 0) {
    return true;
  }

  const options = { dot: true };

  for (const path of paths) {
    const matched = picomatch.isMatch(path, patterns, options);
    core.info(`path: ${path} is matched in patterns: ${JSON.stringify(patterns)}: ${matched}`);

    if (matched) {
      return true;
    }
  }

  return false;
};

export const hasDiffBetween = async (baseSha: string, headSha: string, filters: string[]): Promise<boolean> => {
  core.startGroup(`Checking diff between ${baseSha} and ${headSha}...`);

  try {
    const diff = await getDiff(baseSha, headSha);
    const matched = isMatched(diff, filters);

    if (matched) {
      core.info(`Diff between base: ${baseSha} and head: ${headSha} is true. filters: ${JSON.stringify(filters)}`);
      return true;
    }

    core.info(`Diff between base: ${baseSha} and head: ${headSha} is false. filters: ${JSON.stringify(filters)}`);
    return false;
  } finally {
    core.info("");
    core.endGroup();
  }
};

export const hasBranchDiff = async ({
  owner,
  repo,
  pullNumber,
  token,
  filters
}: {
  owner: string;
  repo: string;
  pullNumber: number;
  token: string;
  filters: string[];
}): Promise<boolean> => {
  core.startGroup(`Checking branch diff for pull request: ${pullNumber}...`);

  try {
    const changedFiles = await listChangedFiles({ owner, repo, pullNumber, token });
    const matched = isMatched(changedFiles, filters);
    if (matched) {
      core.info("This pull request branch has changed files");
      return true;
    }

    core.info("This pull request branch has no changed files");
    return false;
  } finally {
    core.info("");
    core.endGroup();
  }
};
