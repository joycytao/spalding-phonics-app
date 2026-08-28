# Draft Advanced Phonogram Transcripts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate draft narration, examples, and source or missing-source notes for phonograms 71–87 while keeping every unverified record blocked from audio generation.

**Architecture:** Extend the canonical transcript catalog in `src/phonogram-transcripts.js` with an explicit advanced-record draft map. Preserve the existing schema and generation boundary: only `approved` records may be selected for rendering, while uncertain advanced rows remain `blocked` or `pending_approval` as appropriate. Add regression tests that validate coverage, non-placeholder narration, provenance notes, and render eligibility.

**Tech Stack:** Native Node.js ES modules and `node:test`; no new dependencies.

**Spec:** GitHub Issue #5, “Draft and flag transcripts for phonograms 71-87”.

## Global Constraints

- Use the existing 87-item curriculum order and transcript schema.
- Add draft TTS text, examples, and source or missing-source notes for items 71–87.
- Mark curriculum uncertainty explicitly and keep unconfirmed entries blocked from audio generation.
- Do not render or approve audio as part of this issue.

---

### Task 1: Add regression coverage for advanced transcript drafts

**Files:**
- Modify: `test/phonogram-transcripts.test.js`

**Interfaces:**
- Consumes: exported `phonogramTranscripts` and existing transcript validation helpers.
- Produces: executable assertions for advanced-row coverage and render safety.

- [ ] **Step 1: Write the failing test**

  Add tests asserting that records 71–87 have non-placeholder `ttsText`, at least one example or an explicit source/missing-source note, and no `approved` status; assert that all advanced rows are excluded from an approved-only selection.

- [ ] **Step 2: Run test to verify it fails**

  Run: `npm test -- --test-name-pattern='advanced'`
  Expected: FAIL because the current advanced rows use placeholder narration and empty examples.

- [ ] **Step 3: Commit**

  Commit the test-only change with `test: cover advanced transcript draft requirements`.

### Task 2: Populate and flag records 71–87

**Files:**
- Modify: `src/phonogram-transcripts.js`

**Interfaces:**
- Consumes: the existing advanced symbol sequence and transcript builder.
- Produces: 17 transcript records with structured cues, draft narration, examples or provenance notes, and explicit review statuses.

- [ ] **Step 1: Write the minimal implementation**

  Add an advanced transcript map keyed by `sci`, `our`, `eu`, `augh`, `gh`, `que`, `bu`, `lk`, `mb`, `mn`, `st`, `the`, `arr`, `err`, `ssi`, `te`, and `dg`. Merge those records in `buildTranscript`, using `pending_approval` for sourced working drafts and `blocked` where the curriculum/source is not sufficiently verified. Use the existing source URL only where it supports the draft; otherwise store an explicit `source` note that identifies the missing canonical source without presenting it as verified.

- [ ] **Step 2: Run focused tests**

  Run: `npm test -- --test-name-pattern='advanced'`
  Expected: PASS.

- [ ] **Step 3: Run the complete suite and inspect the diff**

  Run: `npm test && git diff --check`
  Expected: all tests pass and the diff has no whitespace errors.

- [ ] **Step 4: Commit**

  Commit the implementation with `feat: draft and flag advanced phonogram transcripts`.
