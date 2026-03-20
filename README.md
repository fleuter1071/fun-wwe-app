# Fun WWE App

A stylized WWE event explorer focused on browsing shows, filtering a season, and moving quickly from an event list into a structured detail view.

## Current MVP Shape

The app currently supports:

- season selection
- search, status filtering, and sort controls
- visible event summary stats
- scrollable event list with thumbnails and event chips
- structured event detail view
- mobile list-to-detail flow
- fallback sample data if live loading fails

## Tech Stack

This starter app is intentionally lightweight:

- plain HTML
- plain CSS
- modular JavaScript
- no framework
- no build step
- small Node server for static delivery plus API access

## Project Structure

```text
fun-wwe-app/
  index.html
  package.json
  server.js
  scripts/
    smoke-test.mjs
  styles/
    main.css
  src/
    app.js
    config.js
    data/
      client.js
    render/
      detail.js
      dom.js
      format.js
      list.js
      stats.js
    shared/
      events.js
    state/
      store.js
```

## File Responsibilities

- `index.html`: app shell and DOM structure
- `styles/main.css`: visual system, layout, responsive behavior
- `src/app.js`: app orchestration and UI event wiring
- `src/shared/events.js`: normalized event contract and shared event helpers
- `server.js`: static file server and `/api/events` backend endpoint
- `package.json`: run scripts and dependency metadata

## Data Source

The app now loads season data through a local backend endpoint, which is responsible for upstream access and normalization.

Notes:

- the backend reads `UPSTREAM_API_KEY` and `UPSTREAM_LEAGUE_ID` from the environment
- if live loading is not configured or upstream fails, the backend degrades to built-in sample data
- the frontend only consumes normalized event payloads from `/api/events`

## Running Locally

### Install dependencies

```powershell
npm install
```

### Configure live upstream access

Create a local `.env` file from `.env.example`, then set:

```text
UPSTREAM_API_KEY=...
UPSTREAM_LEAGUE_ID=...
```

The server will read `.env` automatically on startup.

### Start the local server

```powershell
npm start
```

The app and API will be served at:

```text
http://localhost:4173
```

### Run the smoke test

```powershell
npm run smoke
```

### Run the browser QA pass

```powershell
npm run qa:e2e
```

## Deploying To Render

This app should be deployed as a Render `Web Service`, not a static site, because production needs the Node backend in `server.js` to serve `/api/events`.

This repo now includes `render.yaml` for Blueprint-based setup.

If deploying through the Render dashboard, use:

- Build command: `npm install`
- Start command: `npm start`

Environment variables:

- `UPSTREAM_API_KEY=123`
- `UPSTREAM_LEAGUE_ID=4444`
- `CACHE_TTL_MS=300000`

## Current Limitations

- live upstream credentials still need to be configured for real event loading
- event-derived stats still come from text parsing, even though that logic is now centralized
- there is no browser automation or full UI regression suite yet
- the backend cache is in-memory only and resets on restart

## Recommended Next Steps

1. Configure real upstream credentials and confirm live season loading.
2. Decide the sharper product direction for the app: archive explorer, PLE browser, title-history tracker, or recap companion.
3. Add browser-level regression coverage for the list/detail and mobile back flow.
4. Consider URL-backed selection state if event pages need to be linkable.
5. Move beyond in-memory caching if this becomes a real deployed product.

## Product Direction

Right now this repo is best understood as a polished prototype for a future WWE fan app rather than a finished product. The strongest foundation already in place is the master/detail browsing flow and the dark cinematic event-browser presentation.
