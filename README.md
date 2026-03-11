# Fun WWE App

A stylized single-page WWE event explorer prototype focused on browsing shows, filtering a season, and moving quickly from an event list into a structured detail view.

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
- plain JavaScript
- no framework
- no build step
- local static dev server via `serve`

## Project Structure

```text
fun-wwe-app/
  index.html
  package.json
  styles/
    main.css
  src/
    main.js
```

## File Responsibilities

- `index.html`: app shell and DOM structure
- `styles/main.css`: visual system, layout, responsive behavior
- `src/main.js`: data loading, filtering, rendering, and UI interaction logic
- `package.json`: local dev server script and dependency metadata

## Data Source

The prototype currently attempts to load WWE event data from TheSportsDB using a season-based endpoint.

Notes:

- the current file uses placeholder values for `API_KEY` and `LEAGUE_ID`
- live loading may fail depending on API credentials and browser CORS behavior
- when live loading fails, the app falls back to built-in sample data so the interface still works

## Running Locally

### Install dependencies

```powershell
npm install
```

### Start the local server

```powershell
npm start
```

The app will be served at:

```text
http://localhost:4173
```

## Current Limitations

- API configuration is still placeholder-level
- event parsing is text-derived and not fully structured
- all app logic is still in one JavaScript file
- there is no test setup yet
- there is no backend or persistence layer yet

## Recommended Next Steps

1. Normalize event data into a small data layer.
2. Split rendering into list/detail modules as the app grows.
3. Decide the sharper product direction for the app: archive explorer, PLE browser, title-history tracker, or recap companion.
4. Replace placeholder API settings with a real configuration path.
5. Add lightweight QA coverage once the next feature wave lands.

## Product Direction

Right now this repo is best understood as a polished prototype for a future WWE fan app rather than a finished product. The strongest foundation already in place is the master/detail browsing flow and the dark cinematic event-browser presentation.
