# GCH Support Intake Form — Setup Guide

Wire the form to a Google Sheet (responses) and a Google Drive folder (uploaded letters) using a free Google Apps Script Web App. ~15 minutes, no coding.

**Files involved**
- `index.html` — the form people fill out.
- `GCH_Form_AppsScript_Code.gs` — the script that receives submissions.

---

## Step 1 — Create the Sheet and the Drive folder

1. In Google Drive, create a new **Google Sheet** (name it e.g. *GCH Intake — Responses*).
   - Copy its **ID** from the URL: `docs.google.com/spreadsheets/d/`**`THIS_LONG_PART`**`/edit`.
2. Create a new **Drive folder** (e.g. *GCH — Letters of Support*).
   - Open it and copy its **ID** from the URL: `drive.google.com/drive/folders/`**`THIS_PART`**.

You don't need to add headers to the Sheet — the script creates them on the first submission.

## Step 2 — Create the Apps Script

1. Go to **script.google.com** → **New project**.
2. Delete the sample code, then open `GCH_Form_AppsScript_Code.gs` and **paste its entire contents** in.
3. Near the top, paste your two IDs:
   - `SHEET_ID = '…'`
   - `FOLDER_ID = '…'`
4. Click **Save** (disk icon). Name the project e.g. *GCH Intake*.

## Step 3 — Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Set:
   - **Description:** GCH intake
   - **Execute as:** **Me** (your account — so it can write to your Sheet/Drive)
   - **Who has access:** **Anyone**
4. Click **Deploy**. Google will ask you to **authorize** — approve the permissions (Sheets + Drive). If you see an "unverified app" screen, click **Advanced → Go to (project name)** and allow.
5. Copy the **Web app URL** — it ends in **`/exec`**.

> Tip: to confirm it's live, paste that URL in a browser. You should see *"D!NG GCH intake endpoint is live."*

## Step 4 — Point the form at it

1. Open `index.html` in a text editor.
2. Near the top of the `<script>` block, find the **CONFIG** section and set all three values:
   ```js
   LOS_EMAIL:        "los@dingmidwest.org",              // where emailed letters go
   LOS_TEMPLATE_URL: "https://…/copy",                   // your letter template link
   SUBMIT_ENDPOINT:  "https://script.google.com/…/exec"  // the URL from Step 3
   ```
3. Save.

## Step 5 — Test

1. Open the form, fill it out, check **"Letter of support,"** attach a small PDF, and submit.
2. Confirm:
   - a new row appears in the **Sheet**, and
   - the file appears in the **Drive folder**, with its link in the row's **"LOS file link"** column.

Done. Post the form's link in the GCH Signal group.

---

## Notes & troubleshooting

- **Uploads → Drive:** files land in your folder named `LOS_<Org>_<date>_<original name>`. The link is written into the Sheet row automatically.
- **No login for submitters:** because the script runs *as you*, people filling the form never need a Google account — even to upload.
- **File size:** the form caps uploads at ~20 MB (plenty for a letter). Larger files should be emailed instead.
- **Nothing arriving?** Re-open the Web app URL in a browser (should say "live"). The most common cause is **Who has access** not set to **Anyone**, or the form's `SUBMIT_ENDPOINT` missing the `/exec` ending.
- **Changing the script later:** after edits, **Deploy → Manage deployments → Edit → Version: New version → Deploy** (the `/exec` URL stays the same).
- **Privacy:** keep the Sheet and Drive folder restricted to your team. The form footer already asks people not to include CUI.
