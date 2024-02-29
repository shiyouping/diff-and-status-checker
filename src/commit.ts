import { context } from "src/context";

import * as core from "@actions/core";
import { getOctokit } from "@actions/github";

export const getShas = async (): Promise<string[]> => {
  const { owner, repo, pullNumber, token } = context;
  const octokit = getOctokit(token);

  core.debug(`Listing commits for owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}`);

  const allCommits = [];
  const pageSize = 100;
  let page = 1;
  let res;

  do {
    res = await octokit.rest.pulls.listCommits({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: pageSize,
      page
    });
    core.debug(`Commits response: ${JSON.stringify(res)}`);

    if (!res?.data?.length) {
      break;
    }

    allCommits.push(...res.data);
    page++;
  } while (res.data.length >= pageSize);

  core.debug(`All commits: ${JSON.stringify(allCommits)}`);

  if (!allCommits.length) {
    throw new Error(`No commits found for owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}`);
  }

  // Start from the most recent commit
  const commits = allCommits.map(commit => commit.sha).reverse();

  // Remove the most recent commit, because this is always
  // the commit that triggers this pull request workflow
  commits.shift();
  core.debug(`All commit SHAs except the latest one: ${JSON.stringify(commits)}`);

  return commits;
};
