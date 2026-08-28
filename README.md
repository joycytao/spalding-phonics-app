# Sound Steps

A local-first web app for phonogram practice, self-check exams, and review of missed phonograms.

## Run Locally

Serve this directory with any static web server, then open `index.html` in a browser. For example:

```sh
npx serve .
```

Run the unit tests with:

```sh
npm test
```

## Generate Voicebox Audio

Start Voicebox locally, select or create the narration profile, then run:

```sh
VOICEBOX_PROFILE_ID="your-profile-id" node scripts/generate-audio.mjs
```

The helper submits each narration to Voicebox, polls its asynchronous generation result, downloads the finished audio, and writes it into `audio/`. Listen to and approve every result before distributing the app. The request and download flow follow the [Voicebox API documentation](https://github.com/jamiepine/voicebox#api).

Transcript content that still needs instructional review is marked in `data/phonogram-transcript.json` before release.

## Transcript Data Contract

The ordered transcript catalog lives in `data/phonogram-transcript.json`. It contains all 87 curriculum records with fixed IDs, symbols, groups, local MP3 paths, migrated known narrations, and review status. Runtime validation lives in `src/phonogram-transcripts.js`; the JSON file is the canonical source for transcript content.

Each record includes the curriculum ID, symbol, group, structured `cuePhrases`, approved `ttsText`, examples, source URL, review status, and local MP3 path. Allowed review statuses are `pending_approval`, `approved`, `needs_revision`, and `blocked`.

Keep structured cues, such as `two letters`, `not used`, and `beginning`, separate from the final `ttsText`. The batch audio helper sends only `ttsText` to Voicebox.
