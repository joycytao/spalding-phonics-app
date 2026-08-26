# Phonograms Web App Requirements

## Purpose

The app helps parents who are unfamiliar with Spalding-style phonograms guide a child through practice, and lets children independently replay the sounds while practicing.

## Product Scope

V1 is a responsive, single-page web app with no account or backend. It covers an ordered 87-phonogram curriculum split into:

- 1-26: single-letter phonograms.
- 27-70: multi-letter phonograms.
- 71-87: advanced/additional phonograms.
- 1-87: the complete ordered curriculum.

The user starts a session by selecting `Start Practice` or `Start Exam`, choosing one of the above ranges, then choosing all phonograms in that range or individual phonograms. The session follows the selected phonograms in curriculum order.

## Home And Review

The home screen provides `Start Practice`, `Start Exam`, and `Review`.

`Review` starts a review loop for locally stored incorrect phonograms: practice the queue first, then take an exam on that same queue. If no phonograms are queued, the screen explains that there is nothing to review and offers Home or Start Practice.

## Practice Flow

Practice shows the current phonogram in a large centered card and a `Listen` control. Selecting Listen plays the recorded narration, for example: "ew: oo as in grew; yoo as in new."

After the first playback, `Listen` becomes `Play again`. The bottom controls are Home and Next. Next advances in order; it is omitted on the final phonogram. Home ends the session and returns to the main page.

## Exam Flow

Exam hides the phonogram until the learner presses `Check`. It still provides Listen and plays the same recorded narration. After the first playback, it provides `Play again`, Home, and Check, with an intentionally reserved Next position so controls remain evenly spaced.

Check reveals the phonogram and opens a self-assessment dialog with Correct and Incorrect choices. Correct increments the score. Incorrect increments the score denominator and adds the phonogram to the local review queue. The dialog closes automatically after a choice. Check is then disabled and Next becomes available. Next is omitted for the last item.

The result screen displays `correct / total` and offers Review or Home.

## Progress Storage

V1 stores review-queue entries and completed session summaries in browser-local storage. It must prevent duplicate queue entries and remove an item after the learner answers it correctly in a review exam. Storage is behind a small interface so a future account-backed, cross-device implementation can replace it without altering practice or exam UI behavior.

## Audio

Audio is generated during authoring with Voicebox and bundled as local MP3 files. The user-facing app only plays the approved local file; it does not require Voicebox or Codex on the learner's device. A generation helper accepts the narration in the phonogram data and calls the Voicebox local API. If an audio file is missing or fails to play, the app shows a clear error and retains the current card.

## Curriculum Data And Sources

Each dataset record includes its number, displayed phonogram, curriculum group, narration text, source URL, and MP3 path. Curriculum data is compiled from public references and must be reviewed for instructional accuracy before audio files are considered final.

Sources to record with the data:

- [Spalding phonogram web-app description](https://spalding.org/membership/web-app/)
- [Spalding phonogram sample questions](https://spalding.org/wp-content/uploads/2023/05/opr-step-2-knowledge-and-application-sample-questions.pdf)
- [Valley Academy phonogram helper](https://valleyacademy.com/parents/student-resources/phonogram-helper/)
- [Voicebox local API](https://github.com/jamiepine/voicebox#api)

## UI Direction

Use an original, child-friendly interface. The supplied screenshots are references for interaction hierarchy only: a large centered learning card, a single obvious audio action that becomes replay, and evenly spaced circular navigation controls. Do not reuse the Spalding logo, wordmark, or other brand assets.

### Theme Tokens

- Primary background: `#222831`.
- Secondary elements: `#393E46`.
- Teal accent and primary action: `#00ADB5`.
- Main text: `#EEEEEE`.
- Type family: DM Sans.

The app must work on desktop and mobile, support keyboard controls, provide visible focus states, and give every icon button an accessible name.

## Out Of Scope For V1

- User accounts, cloud storage, and cross-device sync.
- A native app.
- Automatic grading of handwriting.
- Runtime TTS generation on learner devices.
