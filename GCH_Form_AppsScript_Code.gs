/**
 * D!NG — GCH Support Intake  |  Google Apps Script Web App
 * ---------------------------------------------------------------
 * Receives submissions from the intake form (index.html) and:
 *   1) APPENDS each response as a new row in a dedicated tab, and
 *   2) saves any uploaded letter of support into a Drive folder,
 *      writing the file link back into the row.
 *
 * NON-DESTRUCTIVE BY DESIGN — existing tabs are never overwritten:
 *   • It only ever calls insertSheet() (adds a NEW tab) and
 *     appendRow() (adds a row BELOW existing rows).
 *   • It never clears cells, never deletes or renames sheets, and
 *     never writes to any tab other than TAB_NAME.
 *   • If a tab named TAB_NAME already exists but was NOT created by
 *     this script (its header row doesn't match), it writes to a new,
 *     uniquely-named tab instead — so pre-existing data is always safe.
 *
 * SETUP (see GCH_Form_Setup_Guide.md):
 *   1) SHEET_ID is set to your spreadsheet below (change if needed).
 *   2) Create/choose a Drive folder for letters -> paste its ID into FOLDER_ID.
 *   3) Deploy > New deployment > type "Web app"
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Copy the /exec URL into the form's CONFIG.SUBMIT_ENDPOINT.
 * ---------------------------------------------------------------
 */

// ====== EDIT THESE ======
var SHEET_ID  = '1_JuGOFh_XRv88lePR2ryKr1gfV-gkyNBUjJQ39JlWuY'; // your Google Sheet
var TAB_NAME  = 'GCH_Intake_Responses';                          // dedicated tab (created if missing)
var FOLDER_ID = 'PASTE_DRIVE_FOLDER_ID_HERE';                    // Drive folder for uploaded letters
// ========================

// Column header  ->  form field key.  '__letter_url' is the saved Drive link.
var FIELDS = [
  ['Timestamp',            'submitted_at'],
  ['Full name',            'full_name'],
  ['Email',                'email'],
  ['Organization',         'organization'],
  ['Role',                 'role'],
  ['Phone',                'phone'],
  ['LinkedIn / Website',   'linkedin'],
  ['Location',             'location'],
  ['Connection',           'connection'],
  ['Referred by',          'referred_by'],
  ['Help areas',           'help'],
  ['Investor type',        'investor_type'],
  ['Check size',           'check_size'],
  ['Focus areas',          'focus_areas'],
  ['Co-invest',            'coinvest'],
  ['Name as partner',      'name_partner'],
  ['Company name(s)',      'company_name'],
  ['Company description',  'company_desc'],
  ['Dual-use',             'dual_use'],
  ['Relationship / intro', 'relationship'],
  ['Resource types',       'resource_type'],
  ['Capacity',             'capacity'],
  ['Terms',                'terms'],
  ['Domains',              'domains'],
  ['SME willing',          'sme_willing'],
  ['Bio / link',           'bio_link'],
  ['Programs / customers', 'programs'],
  ['Connection nature',    'connection_nature'],
  ['How to help',          'how_help'],
  ['LOS org name',         'org_as_appears'],
  ['LOS signatory',        'signatory'],
  ['LOS when',             'when_provide'],
  ['LOS public use',       'public_use'],
  ['LOS return method',    'return_method'],
  ['LOS file link',        '__letter_url'],
  ['Consent',              'consent'],
  ['Anything else',        'anything_else']
];

function headers_() {
  return FIELDS.map(function (f) { return f[0]; });
}

/**
 * Returns the tab to append to, creating it if needed.
 * Guarantees no existing tab or data is ever overwritten.
 */
function getTargetSheet_(ss) {
  var HEAD = headers_();
  var sh = ss.getSheetByName(TAB_NAME);

  // Case 1: our tab doesn't exist yet -> add a brand-new tab (others untouched).
  if (!sh) {
    sh = ss.insertSheet(TAB_NAME);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    return sh;
  }

  // Case 2: tab exists but is empty -> safe to add the header row.
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    return sh;
  }

  // Case 3: tab exists AND already has data.
  //   If the header row matches ours, it's our tab -> reuse it (append only).
  if (String(sh.getRange(1, 1).getValue()) === HEAD[0]) {
    return sh;
  }

  //   Otherwise it's a pre-existing tab we must not disturb -> make a fresh,
  //   uniquely-named tab so existing information is preserved.
  var tz  = Session.getScriptTimeZone() || 'America/Indiana/Indianapolis';
  var alt = TAB_NAME + '_' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  var s2  = ss.insertSheet(alt);
  s2.appendRow(HEAD);
  s2.setFrozenRows(1);
  return s2;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // avoid two submissions colliding

    var data = JSON.parse(e.postData.contents);

    // 1) If a letter file was attached, decode and save it to Drive.
    var letterUrl = '';
    if (data.letter_file_b64) {
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var bytes  = Utilities.base64Decode(data.letter_file_b64);
      var org    = String(data.organization || 'org').replace(/[^\w.\- ]+/g, '').trim().replace(/\s+/g, '_');
      var stamp  = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Indiana/Indianapolis', 'yyyyMMdd');
      var orig   = data.letter_file_name || 'letter';
      var blob   = Utilities.newBlob(bytes, data.letter_file_type || 'application/octet-stream',
                                     'LOS_' + org + '_' + stamp + '_' + orig);
      letterUrl  = folder.createFile(blob).getUrl();
    }

    // 2) Append the response row to our dedicated tab (never overwrites anything).
    var ss  = SpreadsheetApp.openById(SHEET_ID);
    var sh  = getTargetSheet_(ss);
    var row = FIELDS.map(function (f) {
      if (f[1] === '__letter_url') return letterUrl;
      var v = data[f[1]];
      if (Array.isArray(v)) return v.join(', ');
      return (v === undefined || v === null) ? '' : v;
    });
    sh.appendRow(row); // appends BELOW existing rows

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Visiting the Web app URL in a browser just confirms it's live.
function doGet() {
  return ContentService.createTextOutput('D!NG GCH intake endpoint is live.');
}
