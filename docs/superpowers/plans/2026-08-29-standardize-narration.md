# Standardize Narration Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the human-approved narration conventions to the complete transcript catalog while preserving review status and blocked curriculum records.

**Architecture:** Treat `data/transcript-review-samples.json` as the approved convention fixture and `data/phonogram-transcript.json` as the 87-row content catalog. Add data-contract tests that verify the approved teaching order and ensure standardized rows retain their review state; update only transcript data and the associated tests.

**Tech Stack:** Node.js ES modules, Node built-in test runner, JSON transcript data.

**Spec:** `docs/superpowers/specs/2026-08-26-phonograms-web-design.md`, Issue #7, and the approved Issue #7 comment.

## Global Constraints

- Use the approved order: phonogram → letter-count cue → sound/example pairs → usage or position cue.
- Preserve `pending_approval`, `needs_revision`, and `blocked` rows unless a final reviewer explicitly approves them.
- Do not remove `reviewQuestions`; they are the review audit trail for the representative samples.
- Keep `ttsText` as the exact text sent to Voicebox and keep structured cues separate.

---

### Task 1: Encode the approved review decisions as failing tests

**Files:**
- Modify: `test/phonogram-transcripts.test.js`
- Test: `test/phonogram-transcripts.test.js`

- [ ] **Step 1: Write the failing tests**

Add assertions that the five representative samples are approved in the review package, that their approved `ttsText` follows the approved order, and that the full catalog does not mark every row approved.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test test/phonogram-transcripts.test.js`
Expected: FAIL because the five review samples currently have `reviewStatus: "pending_approval"`.

---

### Task 2: Apply the approved conventions to the review package and catalog

**Files:**
- Modify: `data/transcript-review-samples.json`
- Modify: `data/phonogram-transcript.json`

- [ ] **Step 1: Update only the five approved sample statuses**

Change `reviewStatus` to `approved` for `a`, `th`, `oo`, `ew`, and `ough` in the review package, keeping their reviewed text and review questions intact.

- [ ] **Step 2: Standardize the corresponding full-catalog rows**

Copy the approved sample content and status into matching full-catalog records, preserving curriculum IDs and audio paths. Leave all other rows in their existing review state.

- [ ] **Step 3: Run the focused tests to verify they pass**

Run: `node --test test/phonogram-transcripts.test.js`
Expected: PASS with the approved sample and preservation assertions green.

---

### Task 3: Run the complete verification suite

**Files:**
- Verify: `test/phonogram-transcripts.test.js`, `test/voicebox-request.test.js`, and all existing Node tests.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass with zero failures.

- [ ] **Step 2: Inspect the final data diff**

Run: `git diff --check` and `git diff --stat`
Expected: only the plan, transcript data, and focused data-contract tests are changed; no whitespace errors are reported.

- [ ] **Step 3: Commit the implementation**

Run: `git add docs/superpowers/plans/2026-08-29-standardize-narration.md data/transcript-review-samples.json data/phonogram-transcript.json test/phonogram-transcripts.test.js && git commit -m "feat: standardize transcript narration rules"`

