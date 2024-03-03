import * as core from "@actions/core";
import { getOctokit } from "@actions/github";
import * as octokitPlugin from "@octokit/plugin-rest-endpoint-methods";

const listChecks = async ({
  owner,
  repo,
  token,
  sha
}: {
  owner: string;
  repo: string;
  token: string;
  sha: string;
}): Promise<octokitPlugin.RestEndpointMethodTypes["checks"]["listForRef"]["response"]["data"]["check_runs"]> => {
  core.debug(`Getting checks for owner: ${owner}, repo: ${repo} and ref: ${sha}`);

  const checkRuns = [];
  const octokit = getOctokit(token);
  const responses = octokit.paginate.iterator(octokit.rest.checks.listForRef, { owner, repo, ref: sha, per_page: 100 });

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

  return checkRuns;
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
  let checkRuns = await listChecks({ owner, repo, token, sha });
  if (checkRuns.length === 0) {
    // No checks for this sha
    core.debug(`No checks for owner: ${owner}, repo: ${repo} and sha: ${sha}`);
    return false;
  }

  if (includeJobs.length) {
    const tmp = checkRuns.filter(checkRun => {
      core.info(
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

export type FindLastChecksPassedShaParams = {
  owner: string;
  repo: string;
  token: string;
  includeJobs: string[];
  excludeJobs: string[];
  commitShas: string[];
};

export const findLastChecksPassedSha = async ({
  owner,
  repo,
  token,
  includeJobs,
  excludeJobs,
  commitShas
}: FindLastChecksPassedShaParams): Promise<string | undefined> => {
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

      core.info(
        `Commit ${sha} passed specified checks: ${passed}. includeJobs: ${includeJobs}, excludeJobs: ${excludeJobs}`
      );

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
