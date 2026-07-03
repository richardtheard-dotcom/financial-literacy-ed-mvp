**1. Get the files**

Place all files in the structure shown above (`js/data/courses.js` and `js/data/benchmarks.js` must be nested inside `js/data/`; everything else sits directly in `js/`).

**2. Serve the directory**

Opening `index.html` directly via `file://` will work in most browsers for this app since there are no cross-origin fetches, but a local server is recommended to avoid inconsistent `localStorage` behavior across browsers:

bash

```bash
# Python 3
python3 -m http.server 8000

# Node (no install, via npx)
npx serve .
```

**3. Open in browser**

Navigate to `http://localhost:8000/index.html` (or whichever port your server uses) and complete the onboarding flow.

## Data model notes

- `js/data/courses.js` must load before `js/course.js`, `js/dashboard.js`, `js/progress.js`, and `js/engine.js` — all four read from `COURSES` and/or `COURSES_V2` at load time.
- `js/engine.js` must load before `js/dashboard.js` in `dashboard.html`.
- `js/app-state.js` must load before every other script on every page — it defines `loadState`, `saveState`, `updateState`, and `resetState`, used everywhere.

## Known limitations (pre-1.0)

- `progress.js` currently only counts completions against the legacy `COURSES` array; it undercounts total course count and cannot resolve titles for `COURSES_V2` course IDs.
- Onboarding's review step (`renderReview()`) inserts user-entered text via `innerHTML` without escaping.
- The knowledge-confidence label on the dashboard is inverted due to a scoring formula bug.

## License

Internal project — license terms not yet defined.
