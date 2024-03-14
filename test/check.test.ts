import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";
import { Api } from "@octokit/plugin-rest-endpoint-methods/dist-types/types";
import { PaginateInterface } from "@octokit/plugin-paginate-rest";

import { mock } from "jest-mock-extended";
import { findLastChecksPassedSha, FindLastChecksPassedShaParams } from "src/check";

// Mock the GitHub Actions core library
let mockDebug: jest.SpiedFunction<typeof core.debug>;
let mockInfo: jest.SpiedFunction<typeof core.info>;
let mockStartGroup: jest.SpiedFunction<typeof core.startGroup>;
let mockEndGroup: jest.SpiedFunction<typeof core.endGroup>;
let mockGetOctokit: jest.SpiedFunction<typeof github.getOctokit>;

describe("check.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockDebug = jest.spyOn(core, "debug").mockImplementation();
    mockInfo = jest.spyOn(core, "info").mockImplementation();
    mockStartGroup = jest.spyOn(core, "startGroup").mockImplementation();
    mockEndGroup = jest.spyOn(core, "endGroup").mockImplementation();
    mockGetOctokit = jest.spyOn(github, "getOctokit").mockImplementation();
  });

  test("should pass without any checks", () => {
    // When
    const mockOctokit = mock<Octokit & Api & { paginate: PaginateInterface }>();
    mockOctokit.paginate.iterator.mockReturnValue(null);
    mockGetOctokit.mockReturnValue(mockOctokit);

    // Given
    // Then
  });
});
