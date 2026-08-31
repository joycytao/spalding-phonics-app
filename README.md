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
node scripts/generate-audio.mjs
```

The helper reads the canonical transcript catalog, submits only rows with `reviewStatus: approved` using the validated `story-narrator-01` profile, polls its asynchronous generation result, downloads the finished audio, and writes it to each row's fixed `audioPath`. Override the local Voicebox URL or profile only when explicitly needed:

```sh
VOICEBOX_URL="http://127.0.0.1:17493" \
VOICEBOX_PROFILE_ID="a07dbe47-2f91-4c2b-88df-0551bdaebc99" \
node scripts/generate-audio.mjs
```

The request and download flow follow the [Voicebox API documentation](https://github.com/jamiepine/voicebox#api). Listen to and approve every generated result before distributing the app.

Audio content for advanced phonograms is marked for instructional review in `src/phonograms.js` before release.

## Transcript Data Contract

Transcript records live in `src/phonogram-transcripts.js` and are validated when imported. Each record includes the curriculum ID, symbol, group, structured `cuePhrases`, approved `ttsText`, examples, source URL, review status, and local MP3 path. Allowed review statuses are `pending_approval`, `approved`, `needs_revision`, and `blocked`.

Keep structured cues, such as `two letters`, `not used`, and `beginning`, separate from the final `ttsText`. The batch audio helper sends only `ttsText` to Voicebox.
