import * as core from "@actions/core";
import { getOctokit } from "@actions/github";

export const getCommitShas = async ({
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
  core.startGroup("Getting Git SHAs...");

  try {
    core.debug(`Listing commits for owner: ${owner}, repo: ${repo}, pullNumber: ${pullNumber}`);

    const octokit = getOctokit(token);
    const responses = octokit.paginate.iterator(octokit.rest.pulls.listCommits, {
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100
    });

    let shas = [];

    for await (const response of responses) {
      core.debug(`List commits response: ${JSON.stringify(response)}`);

      if (response.status !== 200) {
        throw new Error(`Failed to list commits for pull request. HTTP status code: ${response.status}`);
      }

      for (const commit of response.data) {
        core.debug(`Commit: ${JSON.stringify(commit)}`);
        shas.push(commit.sha);
      }
    }

    core.debug(`Commit shas for the pull request: ${JSON.stringify(shas)}`);

    // Start from the most recent commit
    shas.reverse();

    // Remove the most recent commit, because this is always
    // the commit that triggers this pull request workflow
    shas.shift();

    core.info(`All commit shas except the latest one: ${JSON.stringify(shas)}`);
    return shas;
  } finally {
    core.info("");
    core.endGroup();
  }
};
