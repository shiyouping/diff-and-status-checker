// import * as core from "@actions/core";
// import * as github from "@actions/github";

// import { findLastChecksPassedSha, FindLastChecksPassedShaParams } from "src/check";

// Mock the GitHub Actions core library
// let debugMock: jest.SpiedFunction<typeof core.debug>;
// let errorMock: jest.SpiedFunction<typeof core.error>;
// let getInputMock: jest.SpiedFunction<typeof core.getInput>;
// let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
// let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;
// let getOctokitMock: jest.SpiedFunction<typeof github.getOctokit>;

describe("check.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // debugMock = jest.spyOn(core, "debug").mockImplementation();
    // errorMock = jest.spyOn(core, "error").mockImplementation();
    // getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    // setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    // setOutputMock = jest.spyOn(core, "setOutput").mockImplementation();
  });

  test("should pass without any jobs", () => {
    // When
    // Given
    // Then
  });
});
