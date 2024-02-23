# Diff and Status Checker for Pull Request

A GitHub action to check if there are any differences in the pull request since last passed checks.

![How it works](./diagram.svg)

## Motivation

When you are waiting for your pull request to be approved and merged, some commit from other people or teams that doesn't change your source code triggers some of the GitHub action workflows to run again. It may take a while to complete the workflows. Then you have to get another approval before merge. This issue becomes extremely painful when you work on a big project or a mono repo that has hundreds of projects. This GitHub action is here to solve this pain point for you. It will look for all changes in the `designated paths` from the most recent commit that passed only the `specified checks` you care about, e.g. unit tests, to the latest commit in a pull request. Then you can make a decision what to do if there are changes or not.

## Example

```yaml
- name: Check diff and status
        id: check-diff-and-status
        uses: actions/diff-and-status-checker@0.0.1
        with:
          filters: |
            src/*
            test/*
          includeJobs: |
            Lint
            Build
            Test

- name: Deploy to production
  id: deploy-to-production
  if: ${{steps.get-status.outputs.hasDiff == 'true'}}
  run: echo "Deploying to production"
```

## Usage

### `token` - (optional) default: `github.token`

The GitHub token used to create an authenticated client.

### `filters` - (optional)

A list of filters delimited by comma or in a new line. If specified, only changed files in the designated paths will be checked; otherwise all will be checked. See [picomatch](https://github.com/micromatch/picomatch) for how to write glob patterns for your paths.

### `includeJobs` - (optional)

A list of GitHub workflow job names delimited by comma or in a new line. If specified, only those jobs in the list will be checked; otherwise all will be checked. Only one of `includeJobs` and `excludeJobs` is allowed. If a commit has no workflow jobs specified in this list, it will be seen as `FAILED`, and the action will continue to check its previous commits.

### `excludeJobs` - (optional)

A list of GitHub workflow job names delimited by comma or in a new line. If specified, those jobs in the list will be skipped; otherwise none will be skipped. Only one of `includeJobs` and `excludeJobs` is allowed. If a commit's workflow jobs are all in this list, it will be seen as `PASSED`, and the action will use the SHA of this commit to calculate the Git difference.
