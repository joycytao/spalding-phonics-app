# Execution Queue

## Queue Rules

This is the repository's single source of truth for agent execution order. The numeric issue-title prefixes are a human-readable summary; this document records dependencies and must be updated before any new issue is inserted.

An issue is eligible only when every listed dependency is complete and the issue is labelled `status: ready to pickup` on GitHub.

## Current Queue

| Order | GitHub issue | Depends on | Status |
| --- | --- | --- | --- |
| 01 | [#1 Define phonogram transcript schema](https://github.com/joycytao/spalding-phonics-app/issues/1) | None | Ready |
| 02 | [#2 Create the 87-item transcript skeleton](https://github.com/joycytao/spalding-phonics-app/issues/2) | #1 | Ready after #1 |
| 03 | [#3 Migrate known phonogram narrations](https://github.com/joycytao/spalding-phonics-app/issues/3) | #1, #2 | Ready after #1 and #2 |
| 04 | [#4 Draft transcripts for phonograms 1-70](https://github.com/joycytao/spalding-phonics-app/issues/4) | #3 | Blocked by #3 |
| 05 | [#5 Draft and flag transcripts for phonograms 71-87](https://github.com/joycytao/spalding-phonics-app/issues/5) | #3 | Blocked by #3 |
| 06 | [#6 Prepare representative transcript review samples](https://github.com/joycytao/spalding-phonics-app/issues/6) | #4, #5 | Blocked by #4 and #5 |
| 07 | [#7 Standardize narration rules across all transcripts](https://github.com/joycytao/spalding-phonics-app/issues/7) | #6 | Blocked by #6 |
| 08 | [#8 Review transcripts in curriculum batches](https://github.com/joycytao/spalding-phonics-app/issues/8) | #7 | Blocked by #7 and final reviewer approval |
| 09 | [#9 Add Voicebox production preflight](https://github.com/joycytao/spalding-phonics-app/issues/9) | #1 | Blocked by #1 |
| 10 | [#10 Refactor the batch audio generator](https://github.com/joycytao/spalding-phonics-app/issues/10) | #8, #9 | Blocked by approved records and #9 |
| 11 | [#11 Add resumable generation and error handling](https://github.com/joycytao/spalding-phonics-app/issues/11) | #10 | Blocked by #10 |
| 12 | [#12 Record render metadata in an audio manifest](https://github.com/joycytao/spalding-phonics-app/issues/12) | #10 | Blocked by #10 |
| 13 | [#13 Render and approve the ew pilot audio](https://github.com/joycytao/spalding-phonics-app/issues/13) | #10, #11, #12 | Blocked by #10-#12 and approved `ew` narration |
| 14 | [#37 Re-review all transcript narrations after the phonogram-first convention update](https://github.com/joycytao/spalding-phonics-app/issues/37) | #7, #13 | Blocked by the convention baseline and `ew` pilot review |
| 15 | [#14 Render cross-category pilot samples](https://github.com/joycytao/spalding-phonics-app/issues/14) | #13, #37 | Blocked by #13 and the full transcript re-review |
| 16 | [#15 Batch-render all approved phonogram audio](https://github.com/joycytao/spalding-phonics-app/issues/15) | #8, #14, #37 | Blocked by approved records, #14, and #37 |
| 17 | [#16 Perform manual phonogram audio quality assurance](https://github.com/joycytao/spalding-phonics-app/issues/16) | #15 | Blocked by #15 |
| 18 | [#17 Integrate transcript-backed audio into the web app](https://github.com/joycytao/spalding-phonics-app/issues/17) | #12, #16 | Blocked by #12 and #16 |
| 19 | [#18 Verify the transcript-to-audio release pipeline](https://github.com/joycytao/spalding-phonics-app/issues/18) | #17 | Blocked by #17 |
| 20 | [#50 Implement playback-gated Next button in Start Practice](https://github.com/joycytao/spalding-phonics-app/issues/50) | None | Ready |
| 21 | [#51 Implement playback-gated Check button in Start Exam](https://github.com/joycytao/spalding-phonics-app/issues/51) | None | Ready |
| 22 | [#45 QA Start Practice for phonograms 1-70](https://github.com/joycytao/spalding-phonics-app/issues/45) | #18, #50 | Pending human QA after #50 |
| 23 | [#46 QA Start Exam for phonograms 1-70](https://github.com/joycytao/spalding-phonics-app/issues/46) | #18, #51 | Pending human QA after #51 |
| 24 | [#47 QA Review for phonograms 1-70](https://github.com/joycytao/spalding-phonics-app/issues/47) | #18 | Pending human QA |
| 25 | [#48 QA letter-to-audio mapping for phonograms 1-70](https://github.com/joycytao/spalding-phonics-app/issues/48) | #18 | Pending human QA |

## Insertions

When a new issue is necessary, insert a row before the first affected dependent issue, state the reason for the insertion, and revise all impacted dependency entries. The agent must then update GitHub issue descriptions and visible ordering references in the same change.

The #50 and #51 rows were inserted before the existing post-release QA stories because they are implementation changes to the Practice and Exam flows. The affected #45 and #46 QA stories now explicitly wait for their corresponding behavior changes; #47 and #48 are unaffected.
