# DING VEDDER — Community Support Intake Form

A lightweight, self-contained web form that lets the D!NG community self-select how they
can support the VEDDER bid (capital, company sourcing, compute/labs, expertise, transition,
or a letter of support). Responses are collected in a Google Sheet and uploaded letters are
saved to a Google Drive folder via a free Google Apps Script Web App.

## Files

| File | What it is |
|------|-----------|
| `index.html` | The form. Single self-contained HTML file — no build, no dependencies. |
| `GCH_Form_AppsScript_Code.gs` | Google Apps Script Web App: logs responses to a Sheet, saves letters to Drive. |
| `GCH_Form_Setup_Guide.md` | Step-by-step setup (~15 min, no coding). |

## Quick start

1. Follow **`GCH_Form_Setup_Guide.md`** to create a Google Sheet + Drive folder and deploy
   the Apps Script as a Web App (Execute as: Me · Who has access: Anyone).
2. In `index.html`, set the three values in the `CONFIG` block near the top
   of the `<script>`:
   - `LOS_EMAIL` — where emailed letters go
   - `LOS_TEMPLATE_URL` — the letter-of-support template link
   - `SUBMIT_ENDPOINT` — the Apps Script Web App URL (ends in `/exec`)
3. Host the HTML (see below) and share the link.

## Deployment (recorded)

| Item | Value |
|------|-------|
| Web App URL (`SUBMIT_ENDPOINT`) | https://script.google.com/macros/s/AKfycbyHe1rJZb-RD2dyJDFePS_7HqiSpMb3ixDMkXl0IwsoNfXgZGRroZWGPXPC27tl0eIxNQ/exec |
| Deployment ID | `AKfycbyHe1rJZb-RD2dyJDFePS_7HqiSpMb3ixDMkXl0IwsoNfXgZGRroZWGPXPC27tl0eIxNQ` |
| Spreadsheet ID | `1_JuGOFh_XRv88lePR2ryKr1gfV-gkyNBUjJQ39JlWuY` |
| Responses tab | `GCH_Intake_Responses` |
| Deployed | 2 July 2026 |

## Hosting (GitHub Pages)

Enabled via **Settings → Pages → Deploy from branch → `main` / root**. The form will be served at:

```
https://gregsapppurdue.github.io/DING_VEDDER_Form/
```


## Security notes

- **Do not commit secrets.** No tokens or API keys live in this repo; the only endpoint is the
  public Apps Script URL, which is safe to expose.
- Keep the responses **Sheet** and the letters **Drive folder** restricted to the D!NG team.
- The form footer asks respondents not to submit CUI or proprietary information.

_Internal D!NG project._
