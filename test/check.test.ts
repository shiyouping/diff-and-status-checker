import * as actionContext from "../src/context";
import { findLastChecksPassedSha } from "../src/check";

import { mock } from "jest-mock-extended";
import * as core from "@actions/core";
import * as github from "@actions/github";

jest.mock("../src/context");

describe("check.ts", () => {
  actionContext.context;

  // const contextMock = mock<actionContext.Context>();
  // Object.assign(contextMock, {
  //   owner: "owner",
  //   repo: "repo",
  //   token: "token",
  //   includeJobs: ["a", "b"],
  //   excludeJobs: ["a", "b"]
  // });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("no name", () => {
    findLastChecksPassedSha(["1", "2"], "ref");
  });
});
