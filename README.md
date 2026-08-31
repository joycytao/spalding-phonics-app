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

The renderer can resume safely when `audio/render-manifest.json` contains a completed entry whose transcript version, profile ID, output path, and file all still match. It skips those current rows, retries changed or incomplete rows, and reports every failed row without stopping the rest of the batch.

Each attempted render also updates `audio/render-manifest.json` with the transcript version, phonogram, profile name and ID, engine, model, Voicebox generation ID, output path, timestamp, and `completed` or `failed` status. Failed entries include the actionable error and do not create placeholder audio.

Transcript content that still needs instructional review is marked in `data/phonogram-transcript.json` before release.

Before generating audio, verify that Voicebox is reachable and the production profile is available:

```sh
npm run voicebox:preflight
```

The preflight checks `/health` and `/profiles` using the local Voicebox REST API. A downloaded but unloaded model (`model_loaded=false` and `model_downloaded=true`) is reported as idle and remains render-ready; the command fails for an unavailable model or a missing/mismatched `story-narrator-01` profile.

## Transcript Data Contract

The ordered transcript catalog lives in `data/phonogram-transcript.json`. It contains all 87 curriculum records with fixed IDs, symbols, groups, local MP3 paths, draft or migrated narration, examples, and review status. Runtime validation lives in `src/phonogram-transcripts.js`; the JSON file is the canonical source for transcript content.

Each record includes the curriculum ID, symbol, group, structured `cuePhrases`, approved `ttsText`, examples, source URL, review status, and local MP3 path. Allowed review statuses are `pending_approval`, `approved`, `needs_revision`, and `blocked`.

Keep structured cues, such as `two letters`, `not used`, and `beginning`, separate from the final `ttsText`. The batch audio helper sends only `ttsText` to Voicebox.
