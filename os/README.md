# ALAYA OS — 24/7 Cloud Pipeline

Cron-driven affiliate pipeline. Runs entirely in the cloud (GitHub Actions +
Google Apps Script). Your computer being off changes nothing.

## Setup (one time)
See `../START_HERE.md` in the deploy kit, Steps 3–5.

## What runs, on what schedule (all cloud-side)

| Schedule (UTC) | What | File |
|---|---|---|
| every 6h | Intake + row driving | `orchestrator/dispatch.js` |
| hourly | Price/stock/link/freshness monitors | `monitors/index.js` |
| 13:00 (9am ET) | Daily monitors + owner email | Apps Script `sendDailyOwnerEmail` |
| Fri 22:00 | Weekly review | `agents/weekly_review.js` |

## Required GitHub Secrets
| Secret | Meaning |
|---|---|
| `SHEET_WEBHOOK_URL` | Apps Script web-app URL (Deploy → Web app) |
| `STATE_WEBHOOK_SECRET` | same value set via `setStateSecret()` in Apps Script |
| `AMAZON_TAG` | your Associate tag (…-20) |

## Hard invariant
`PENDING_APPROVAL → APPROVED` exists ONLY as the Owner's dropdown action in the
Google Sheet. No code path — in this repo or anywhere — can set it.
