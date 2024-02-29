import * as core from "@actions/core";
import { getOctokit } from "@actions/github";

const checkJobs = (includeJobs: string[], excludeJobs: string[]): void => {
  if (includeJobs.length > 0 && excludeJobs.length > 0) {
    throw new Error("Only one of includeJobs and excludeJobs is allowed!");
  }
};

const areChecksPassed = async ({
  owner,
  repo,
  token,
  sha,
  includeJobs,
  excludeJobs
}: {
  owner: string;
  repo: string;
  token: string;
  sha: string;
  includeJobs: string[];
  excludeJobs: string[];
}): Promise<boolean> => {
  checkJobs(includeJobs, excludeJobs);

  core.debug(`Getting checks for owner: ${owner}, repo: ${repo} and ref: ${sha}`);
  const octokit = getOctokit(token);

  const responses = octokit.paginate.iterator(octokit.rest.checks.listForRef, { owner, repo, ref: sha, per_page: 100 });

  let checkRuns = [];

  for await (const response of responses) {
    core.debug(`Check runs response: ${JSON.stringify(response)}`);

    if (response.status !== 200) {
      throw new Error(`Failed to list checks. HTTP status code: ${response.status}`);
    }

    for (const checkRun of response.data) {
      core.debug(`Check run: ${JSON.stringify(checkRun)}`);
      checkRuns.push(checkRun);
    }
  }

  core.debug(`All check runs: ${JSON.stringify(checkRuns)}`);

  if (checkRuns.length === 0) {
    // No checks for this sha
    core.debug(`No checks for owner: ${owner}, repo: ${repo} and sha: ${sha}`);
    return false;
  }

  if (includeJobs.length) {
    const tmp = checkRuns.filter(checkRun => {
      core.debug(
        `Check run head SHA: ${checkRun.head_sha}, name: ${checkRun.name}, status: ${checkRun.status}, conclusion: ${checkRun.conclusion}`
      );

      return includeJobs.includes(checkRun.name);
    });

    if (!tmp.length) {
      core.debug(`SHA: ${sha} has no check job specified by includeJobs: ${JSON.stringify(includeJobs)}`);
      return false;
    }

    checkRuns = tmp;
  }

  if (excludeJobs.length) {
    const tmp = checkRuns.filter(checkRun => {
      core.debug(
        `Check run head SHA: ${checkRun.head_sha}, name: ${checkRun.name}, status: ${checkRun.status}, conclusion: ${checkRun.conclusion}`
      );

      return !excludeJobs.includes(checkRun.name);
    });

    if (!tmp.length) {
      core.debug(`SHA: ${sha} has check jobs all specified by excludeJobs: ${JSON.stringify(excludeJobs)}`);
      return true;
    }

    checkRuns = tmp;
  }

  return checkRuns.every(
    checkRun =>
      checkRun.conclusion === "neutral" || checkRun.conclusion === "success" || checkRun.conclusion === "skipped"
  );
};

export const findLastChecksPassedSha = async ({
  owner,
  repo,
  token,
  includeJobs,
  excludeJobs,
  commitShas
}: {
  owner: string;
  repo: string;
  token: string;
  includeJobs: string[];
  excludeJobs: string[];
  commitShas: string[];
}): Promise<string | undefined> => {
  core.startGroup("Finding the last commit that passed the specified checks...");

  try {
    for (const sha of commitShas) {
      const passed = await areChecksPassed({
        owner,
        repo,
        token,
        sha,
        includeJobs,
        excludeJobs
      });

      core.info(`Commit ${sha} passed specified checks: ${passed}`);

      if (passed) {
        // This is the most recent commit that passed checks
        return sha;
      }
    }

    // Can't find one
    return undefined;
  } finally {
    core.info("");
    core.endGroup();
  }
};
