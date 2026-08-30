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

## Stale Pickup Reclaim

A `CODEX_AGENT_PICKUP` marker prevents duplicate work only while it represents active work. An agent may reclaim the first eligible issue in queue order when all of the following are true:

1. The issue has a pickup marker.
2. The issue has no open pull request and no identifiable in-progress branch.
3. The marker has no valid progress update that shows active work.

Before starting reclaimed work, the agent must leave a new issue comment stating that it verified the prior pickup is stale and is reclaiming the issue. It must then continue execution rather than skipping the issue. A pickup marker alone is not a reason to block the queue.

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

## Review And Evidence Gates

Before selecting an Issue, inspect all open pull requests first. Record every
new review or issue comment since the last automation-memory checkpoint and
handle it before starting new work. A normal review fix updates the existing
branch and PR; create a dependency Issue only when the comment identifies a
separate prerequisite that cannot be completed in the same change.

Every implementation decision must cite concrete repository evidence: an Issue
body or comment, PR diff or review comment, failing check, test result, or
execution-queue entry. Convert the selected evidence into one explicit
acceptance criterion before editing. If the evidence is ambiguous, stop and
request the missing decision rather than inferring intent.

Every completed run must record the exact verification commands and outcomes.
If browser verification is relevant but the already-installed runtime is not
available, record the exact skip reason; treat it as blocking only when the
selected Issue explicitly requires browser-flow verification.
