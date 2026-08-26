# Phonograms Web V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first phonogram practice, exam, and review web app covering the selected 87-item curriculum.

**Architecture:** Use plain HTML, CSS, and JavaScript modules. Keep session logic and local-progress storage pure and separately tested; render all screen states from a single application entry point.

**Tech Stack:** HTML, CSS, modern browser JavaScript modules, Node's built-in test runner, Voicebox local HTTP API for authoring audio.

**Spec:** `docs/superpowers/specs/2026-08-26-phonograms-web-design.md`

## Global Constraints

- Browser-local progress only in V1.
- Original visual design; supplied Spalding screenshots are interaction references only.
- Audio files are local MP3 assets generated and reviewed during authoring.
- Support desktop and mobile keyboard-accessible controls.

---

### Task 1: Core Curriculum And Session Logic

**Files:**
- Create: `package.json`, `src/phonograms.js`, `src/session.js`, `test/session.test.js`

**Interfaces:**
- Produces `createSession(ids, phonograms)`, `advance(session)`, `recordExamDecision(session, isCorrect)`, and `orderedSelection(ids, phonograms)`.

- [ ] Write failing tests for ordered selection, final-card navigation, and score calculation.
- [ ] Run `npm test` and confirm the tests fail because the modules are absent.
- [ ] Implement the minimal curriculum and session functions.
- [ ] Run `npm test` and confirm the tests pass.

### Task 2: Local Review Storage

**Files:**
- Create: `src/progress-store.js`, `test/progress-store.test.js`

**Interfaces:**
- Produces `createProgressStore(storage)` with `getReviewQueue`, `recordIncorrect`, and `removeReviewedCorrect`.

- [ ] Write failing tests for deduplication and removal after a correct review-exam answer.
- [ ] Run `npm test` and confirm the tests fail because the store is absent.
- [ ] Implement the minimal local-storage repository.
- [ ] Run `npm test` and confirm the tests pass.

### Task 3: App Screens And Audio Controls

**Files:**
- Create: `index.html`, `src/app.js`, `src/audio.js`, `styles.css`

**Interfaces:**
- Consumes session and progress-store modules.
- Produces Home, selection, practice, exam, result, and review-empty screen rendering.

- [ ] Write a browser-facing test for the practice and exam control transitions.
- [ ] Run the test and confirm it fails before screen rendering exists.
- [ ] Implement the shared card UI and screen-state transitions.
- [ ] Run all tests and manually check desktop/mobile layouts.

### Task 4: Voicebox Authoring Workflow

**Files:**
- Create: `scripts/generate-audio.mjs`, `audio/.gitkeep`, `README.md`

**Interfaces:**
- Consumes narration text from `src/phonograms.js` and writes named MP3 files to `audio/` through Voicebox's local API.

- [ ] Write a failing test for generation-request construction without calling a live service.
- [ ] Implement request construction and a clear missing-service failure.
- [ ] Document how to start Voicebox, generate audio, and review the output before release.
- [ ] Run all tests and verify the app's missing-audio state.
