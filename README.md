# Behrad Zangi — Economic Intelligence V23

Static GitHub Pages portfolio with an upgraded economic intelligence workspace.

## What is fixed
- Critical selector bug in the old rate loader (missing `#` for ID lookup) corrected by replacing it with a validated, resilient client.
- Historical chart, seven-day to six-month ranges, currency calculator, CSV export, source attribution and retry flow.
- A blank market preview on the home page is replaced by an animated economic terminal.
- Public Frankfurter daily reference rates; no account, API key, or backend required. Not real-time market prices.
- Failed requests never invent values. Previously fetched rates may appear marked **Saved** or **Cached**.

## Publish
Extract the ZIP and upload **all files inside**, not the ZIP, to the root of `behradzangi.github.io` on branch `main`. Commit and check GitHub Actions → Pages. Hard-refresh after deployment.

## Troubleshooting
Open `intelligence.html`, click Refresh. If the provider is blocked by a browser extension or offline, the website shows a clear error; open `https://frankfurter.dev/` to verify provider access. For browser diagnostics open Developer Tools → Console / Network and inspect `api.frankfurter.dev`. Avoid opening `file://` locally for API validation: use a local server such as `python -m http.server 8080`.

## Validation
Browser and JavaScript checks performed locally; actual production GitHub Pages deployment is not made by this package.


## Persian and English language switch (V24)
A language toggle is provided on each page. It persists the selection in localStorage and changes page direction (RTL Persian / LTR English). This is client-side localization and does not require a service or key. English is the default. For SEO indexing of both languages separately, static locale URLs with hreflang can be developed later. The original market rates remain real reference feed values, not translated or substituted.
