import { findLastChecksPassedSha } from "src/check";
import { getCommitShas } from "src/commit";
import { context } from "src/context";
import { hasBranchDiff, hasDiffBetween } from "src/diff";

import * as core from "@actions/core";

const checkEvent = (eventName: string): void => {
  // May add new events in the future
  const validEvents = ["pull_request"];

  if (!validEvents.includes(eventName)) {
    throw new Error(`${eventName} is not a valid event.`);
  }
};

const checkJobs = (includeJobs: string[], excludeJobs: string[]): void => {
  if (includeJobs.length > 0 && excludeJobs.length > 0) {
    throw new Error("Only one of includeJobs and excludeJobs is allowed!");
  }
};

const writeOutput = (hasDiff: boolean): void => {
  const result = hasDiff ? "true" : "false";
  core.setOutput("hasDiff", result);
  core.info(`Output is hasDiff: ${result}`);
};

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export const run = async (): Promise<void> => {
  try {
    const { headSha, eventName, filters, token, pullNumber, owner, repo, includeJobs, excludeJobs } = context;
    checkEvent(eventName);
    checkJobs(includeJobs, excludeJobs);

    let hasDiff = await hasBranchDiff({ filters, token, pullNumber, owner, repo });
    if (!hasDiff) {
      // This PR doesn't have a change
      writeOutput(false);
      return;
    }

    const commitShas = await getCommitShas({
      owner,
      repo,
      pullNumber,
      token
    });

    let lastChecksPassedSha = await findLastChecksPassedSha({
      owner,
      repo,
      token,
      includeJobs,
      excludeJobs,
      commitShas
    });

    if (!lastChecksPassedSha) {
      // This PR has changed files but doesn't have any specified checks passed
      writeOutput(true);
      return;
    }

    hasDiff = await hasDiffBetween(lastChecksPassedSha, headSha, filters);
    writeOutput(hasDiff);
  } catch (error) {
    core.debug(`Failed to check diff. Error: ${JSON.stringify(error)}`);
    if (error instanceof Error) {
      core.setFailed(error);
    }
  }
};
