import {findLastChecksPassedSha} from "src/check";
import {getShas} from "src/commit";
import {context} from "src/context";
import {hasDiff} from "src/diff";

import * as core from "@actions/core";

const checkEvent = (eventName: string): void => {
  const validEvents = ["pull_request", "pull_request_review", "pull_request_review_comment", "pull_request_target"];

  if (!validEvents.includes(eventName)) {
    throw new Error(`${eventName} is not a valid event.`);
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
    const {baseSha, headSha, eventName, filters} = context;
    checkEvent(eventName);

    let hasChanges = await hasDiff(baseSha, headSha, []);
    if (!hasChanges) {
      // This PR doesn't have a change
      writeOutput(hasChanges);
      return;
    }

    const shas = await getShas();
    let lastChecksPassedSha = await findLastChecksPassedSha(shas, baseSha);
    hasChanges = await hasDiff(lastChecksPassedSha, headSha, filters);
    writeOutput(hasChanges);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
};
