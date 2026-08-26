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

Audio content for advanced phonograms is marked for instructional review in `src/phonograms.js` before release.
