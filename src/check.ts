import {context} from "src/context";

import * as core from "@actions/core";
import {getOctokit} from "@actions/github";

const checkJobs = (includeJobs: string[], excludeJobs: string[]): void => {
  if (includeJobs.length > 0 && excludeJobs.length > 0) {
    throw new Error("Can not have both includeJobs and excludeJobs");
  }
};

const allChecksPassed = async (ref: string): Promise<boolean> => {
  const {owner, repo, token, includeJobs, excludeJobs} = context;
  checkJobs(includeJobs, excludeJobs);

  const octokit = getOctokit(token);
  core.debug(`Getting checks for owner: ${owner}, repo: ${repo} and ref: ${ref}`);

  const pageSize = 100;
  let page = 1;
  let res;
  let checkRuns = [];

  do {
    res = await octokit.rest.checks.listForRef({owner, repo, ref, page, per_page: pageSize});
    core.debug(`Check run response: ${JSON.stringify(res)}`);

    if (!res.data?.check_runs?.length) {
      break;
    }

    checkRuns.push(...res.data.check_runs);
    page++;
  } while (checkRuns.length < res.data.total_count);

  core.debug(`All check runs: ${JSON.stringify(checkRuns)}`);

  if (!checkRuns.length) {
    // No checks for this ref
    core.debug(`No checks for owner: ${owner}, repo: ${repo} and ref: ${ref}`);
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
      core.debug(`SHA: ${ref} has no check job specified by includeJobs: ${JSON.stringify(includeJobs)}`);
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
      core.debug(`SHA: ${ref} has check jobs all specified by excludeJobs: ${JSON.stringify(excludeJobs)}`);
      return true;
    }

    checkRuns = tmp;
  }

  return checkRuns.every(
    checkRun =>
      checkRun.conclusion === "neutral" || checkRun.conclusion === "success" || checkRun.conclusion === "skipped"
  );
};

export const findLastChecksPassedSha = async (shas: string[], defaultSha: string): Promise<string> => {
  for (const sha of shas) {
    const allPassed = await allChecksPassed(sha);
    core.info(`Commit ${sha} has specified checks passed: ${allPassed}`);

    if (allPassed) {
      // This is the most recent commit that passed all checks
      return sha;
    }
  }

  return defaultSha;
};
