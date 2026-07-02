/**
 * D!NG — GCH Support Intake  |  Google Apps Script Web App
 * ---------------------------------------------------------------
 * Receives submissions from GCH_Support_Intake_Form.html and:
 *   1) appends each response as a row in a Google Sheet, and
 *   2) saves any uploaded letter of support into a Drive folder,
 *      writing the file link back into the sheet row.
 *
 * SETUP (full steps in GCH_Form_Setup_Guide.md):
 *   1) Make a Google Sheet -> paste its ID into SHEET_ID below.
 *   2) Make a Drive folder for letters -> paste its ID into FOLDER_ID.
 *   3) Deploy > New deployment > type "Web app"
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Copy the Web app URL (ends in /exec) into the form's
 *      CONFIG.SUBMIT_ENDPOINT.
 * ---------------------------------------------------------------
 */

// ====== EDIT THESE TWO ======
var SHEET_ID  = 'PASTE_GOOGLE_SHEET_ID_HERE';   // from the Sheet URL: /d/THIS_PART/edit
var FOLDER_ID = 'PASTE_DRIVE_FOLDER_ID_HERE';   // from the folder URL: /folders/THIS_PART
// ============================

var SHEET_TAB = 'Responses';

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

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // avoid two submissions colliding on the same row

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

    // 2) Append the response row (creating the header row on first run).
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(SHEET_TAB) || ss.insertSheet(SHEET_TAB);
    if (sh.getLastRow() === 0) {
      sh.appendRow(FIELDS.map(function (f) { return f[0]; }));
      sh.setFrozenRows(1);
    }
    var row = FIELDS.map(function (f) {
      if (f[1] === '__letter_url') return letterUrl;
      var v = data[f[1]];
      if (Array.isArray(v)) return v.join(', ');
      return (v === undefined || v === null) ? '' : v;
    });
    sh.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Errors are logged; the form still shows its thank-you either way.
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
