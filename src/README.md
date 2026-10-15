# Verinex Group — Client Onboarding

Deliverables for onboarding new billing clients.

| File | What it is |
|---|---|
| `dist/Verinex-Client-Onboarding-Guide.pdf` | Branded 17-page guide: cover, context, engagement models, questionnaire, process, integrations, documents, finalize, issues |
| `dist/verinex-client-onboarding.html` | Interactive onboarding page (single self-contained file — host anywhere or open locally) |
| `dist/Verinex-Client-Onboarding-Guide.html` | Print layout used to make the PDF |
| `data.js` | **All content** — questions, branching rules, documents, phases, issues, software notes |
| `app.template.html` | Interactive page layout and logic |
| `build.js` | Builds everything in `dist/` |

## Editing

1. Change text or rules in `data.js`. A question appears only when its `show(answers)` returns true; a document appears when `when(answers)` returns a reason string.
2. Rebuild: `NODE_PATH=$(npm root -g) node docs/verinex-onboarding/build.js` (PDF needs Playwright + Chromium; otherwise print the guide HTML to PDF from a browser).

## Branding

- Colors from verinexgroup.com: blue `#3b728e`, green `#62b88a`, white ground. Tokens sit at the top of the `<style>` in `app.template.html` and in the guide CSS inside `build.js`.
- Logo: `verinex-logo.png` (background removed) is embedded in the PDF; `verinex-logo-web.png` (480px) in the web page and PDF page headers.

## Interactive page notes

- Sections are deep-linkable: `#overview`, `#questions`, `#q-systems` (any step id), `#process`, `#documents`, `#finalize`, `#issues`.
- Answers, document check-offs and sign-off save in the viewer's browser (localStorage `vx_onboarding_v1`); nothing is sent to a server yet. "Copy summary" on Finalize gives a text summary to email or paste into the CRM.
- Opens with example answers (clearly bannered) the first time; "Start with a blank form" clears them.
