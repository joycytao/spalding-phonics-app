# Agent Execution Rules

## Purpose

This file defines the mandatory issue-selection process for every agent working on this repository. GitHub's issue list order is not an execution plan because it changes when issues are created or updated.

`docs/execution-queue.md` is the single source of truth for execution order, dependencies, and the next eligible issue.

## Required Workflow

Before starting implementation work, every agent must:

1. Read `docs/execution-queue.md`.
2. Browse every open GitHub issue labelled `status: ready to pickup` and read its current title, body, labels, comments, and linked pull requests.
3. Select the first issue in execution-queue order whose dependencies are complete and whose GitHub status is ready.
4. Do not start a later issue merely because it is visible first in GitHub's default issue list.
5. If no issue is eligible, report the blocking dependency and do not bypass the queue without an explicit project decision.

## Adding Or Splitting Work

Before creating a new issue, or splitting an existing issue into smaller work:

1. Identify the new issue's dependencies and the issue(s) that must follow it.
2. Update `docs/execution-queue.md` first with the new position, dependencies, and insertion reason.
3. Create or update the GitHub issue with links to its prerequisites and follow-on work.
4. Update affected issue titles or issue bodies so their visible sequence and dependency links agree with the queue.
5. Include the queue update in the same pull request as the implementation or issue-management change.

Do not silently insert work. Any inserted issue must make its effect on the remaining order explicit.

## Transcript And Audio Rule

For phonogram narration work, only records with `approvalStatus: approved` may be rendered as release audio. Draft transcript content remains `pending_approval` until the designated final reviewer approves it against the expert reference video and recorded source evidence.
