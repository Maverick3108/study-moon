/**
 * Study Moon cloud storage.
 * Stores the whole app state as JSON in a Google Sheet, so progress survives incognito.
 *
 * Setup:
 * 1. Create a new Google Sheet, then Extensions > Apps Script.
 * 2. Replace everything in Code.gs with this file.
 * 3. Change SECRET below to a long random string, and paste the same string into SYNC_KEY in index.html.
 * 4. Run the `setup` function once and approve the permissions.
 * 5. Deploy > New deployment > type Web app. Execute as: Me. Who has access: Anyone.
 * 6. Copy the web app URL (ends in /exec) into SYNC_URL in index.html.
 * After editing this file later, use Deploy > Manage deployments > edit > New version, so the URL stays the same.
 */

const SECRET = "CHANGE_ME_TO_A_LONG_RANDOM_STRING";
const SHEET_NAME = "StudyMoon";
const CHUNK = 40000;   // a Sheets cell holds up to 50,000 characters
const MARK = "~";      // prefix so no chunk is ever read as a number or a formula

function doGet(e) {
  if (!authorised_(e && e.parameter && e.parameter.key)) return json_({ ok: false, error: "Wrong key" });
  return json_({ ok: true, state: read_() });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, error: "Bad request" }); }
  if (!authorised_(body.key)) return json_({ ok: false, error: "Wrong key" });
  if (!body.state || typeof body.state !== "object") return json_({ ok: false, error: "No state sent" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const current = read_();
    // An older copy (for example a tab left open on another device) never overwrites newer progress.
    if (current && current.updatedAt && body.state.updatedAt && body.state.updatedAt < current.updatedAt) {
      return json_({ ok: true, stale: true, state: current });
    }
    write_(body.state);
    return json_({ ok: true, updatedAt: body.state.updatedAt || null });
  } finally {
    lock.releaseLock();
  }
}

/** Run once from the editor to create the sheet and grant permissions. */
function setup() {
  sheet_();
  Logger.log("Ready. Now deploy as a web app.");
}

function authorised_(key) {
  return typeof key === "string" && key.length > 0 && key === SECRET && SECRET !== "CHANGE_ME_TO_A_LONG_RANDOM_STRING";
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function read_() {
  const sh = sheet_();
  const last = sh.getLastRow();
  if (!last) return null;
  const text = sh.getRange(1, 1, last, 1).getValues()
    .map(r => String(r[0] || ""))
    .filter(v => v.charAt(0) === MARK)
    .map(v => v.slice(1))
    .join("");
  if (!text) return null;
  try { return JSON.parse(text); } catch (err) { return null; }
}

function write_(state) {
  const text = JSON.stringify(state);
  const rows = [];
  for (let i = 0; i < text.length; i += CHUNK) rows.push([MARK + text.slice(i, i + CHUNK)]);
  const sh = sheet_();
  sh.getRange("A:A").setNumberFormat("@");
  sh.clearContents();
  sh.getRange(1, 1, rows.length, 1).setValues(rows);
  sh.getRange(1, 2).setValue("Last saved: " + new Date().toString());
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
