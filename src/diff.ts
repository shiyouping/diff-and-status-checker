import * as core from "@actions/core";
import {getExecOutput} from "@actions/exec";
import picomatch from "picomatch";

const getDiff = async (baseSha: string, headSha: string): Promise<string[]> => {
  core.startGroup("Getting Git diff...");
  let output = "";

  try {
    output = (await getExecOutput("git", ["diff", "--name-only", baseSha, headSha])).stdout;
  } finally {
    core.info("");
    core.endGroup();
  }

  core.debug(`Execution output: ${output}`);

  const diff = output.split("\n").filter(path => path.trim().length > 0);
  core.debug(`Diff: ${JSON.stringify(diff)}`);

  return diff;
};

export const hasDiff = async (baseSha: string, headSha: string, filters: string[]): Promise<boolean> => {
  const diff = await getDiff(baseSha, headSha);

  if (diff.length > 0 && filters.length === 0) {
    core.info(`Diff between base ${baseSha} and head ${headSha} is true`);
    return true;
  }

  const options = {dot: true};

  for (const d of diff) {
    const matched = picomatch.isMatch(d, filters, options);
    core.debug(`Diff: ${d} is matched in filters ${JSON.stringify(filters)}: ${matched}`);

    if (matched) {
      return true;
    }
  }

  core.info(`Diff between base: ${baseSha} and head: ${headSha} is false`);
  return false;
};
