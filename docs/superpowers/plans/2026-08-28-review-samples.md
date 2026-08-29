# Representative Transcript Review Samples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a focused, review-ready package for a, th, oo, ew, and ough before applying narration conventions to the full curriculum.

**Architecture:** Keep canonical transcript records in `data/phonogram-transcript.json` unchanged and add a separate JSON review artifact containing exact sample snapshots and reviewer prompts. Validate the artifact with the existing Node test suite so the sample set, categories, pending status, and convention decisions remain stable.

**Tech Stack:** JSON, native Node.js ES modules, and `node:test`; no new dependencies.

**Spec:** GitHub Issue #6, “Prepare representative transcript review samples”.

## Global Constraints

- Review exactly `a`, `th`, `oo`, `ew`, and `ough` in that order.
- Cover single-letter, voiced or unvoiced, multiple-sound, and complex phonogram patterns.
- Record decisions about symbol naming, phonetic notation, examples, and pauses.
- Keep all sample records `pending_approval`; do not render or approve audio.

---

### Task 1: Define and verify the review package contract

**Files:**
- Create: `data/transcript-review-samples.json`
- Modify: `test/phonogram-transcripts.test.js`

**Interfaces:**
- Consumes: canonical transcript records in `data/phonogram-transcript.json`.
- Produces: `sampleSymbols`, `conventionDecisions`, and five sample records with `reviewQuestions`.

- [ ] **Step 1: Write the failing test**

  Import `data/transcript-review-samples.json` and assert the required sample order, four convention decision labels, five pending records, examples, and reviewer questions.

- [ ] **Step 2: Run the focused test to verify it fails**

  Run: `npm test -- --test-name-pattern='representative transcript review package'`
  Expected: FAIL because the review package does not exist.

- [ ] **Step 3: Add the review package**

  Copy the current canonical fields for the five requested records and attach concise questions that explicitly address naming, notation, examples, and pause placement. Preserve `pending_approval` for every sample.

- [ ] **Step 4: Run focused and complete verification**

  Run: `npm test -- --test-name-pattern='representative transcript review package' && npm test && git diff --check`
  Expected: focused and complete tests pass with no whitespace errors.

- [ ] **Step 5: Commit**

  Commit with `feat: prepare representative transcript review samples`.
