# Phonograms Web V1 Design

## Architecture

The app is a static single-page application backed by a data module, a session-state module, a local-progress repository, and shared card rendering. The UI is a screen-state machine: home, range selection, phonogram selection, practice, exam, result, review-empty, and review-practice/review-exam. Browser local storage implements the repository for V1; a future remote repository will retain the same methods.

## Components

- `phonograms`: ordered curriculum data plus narration and audio metadata.
- `session`: selection ordering, cursor movement, exam decisions, score calculation, and review transitions.
- `progress-store`: read/write review queue and session summaries.
- `app`: routes screen state to DOM rendering and wires controls to the pure session functions.
- `audio`: plays a named local MP3 and reports playback failures to the UI.

## Data Flow

The selection screen turns selected phonogram ids into an ordered session. Practice renders the symbol and plays its audio. Exam renders only audio controls until Check; the self-assessment result updates score and the review queue. At the end of a normal exam, the result screen uses the session score. At the end of review practice, the app automatically creates a review exam session using the same ids.

## Error Handling

No selected phonograms prevents session start and shows a prompt. An unavailable audio file keeps the current item on screen and displays a retryable error. An empty review queue renders an explanatory empty state instead of creating an empty session.

## Validation

Unit tests cover the pure selection, navigation, scoring, and queue behavior. Browser-level checks cover the practice and exam control transitions, the result flow, and responsive rendering.
