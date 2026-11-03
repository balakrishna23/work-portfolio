/**
 * Cutsway enquiries: the website's "Book a call" form posts here.
 * Each enquiry is emailed to the Gmail account that deploys this script, filed under the "Cutsway Enquiries" label
 * (reply-to is the person, so answering is one click), and kept as a row in this Google Sheet.
 *
 * Setup (once): open a new Google Sheet, then Extensions → Apps Script, paste this file, save,
 * Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone), and put the web app URL
 * in shared/site-config.js as formUrl. Full steps: launch/README.md.
 */
const LABEL = 'Cutsway Enquiries';
const SKIP_INBOX = false;   // true: enquiries go only to the label, not the inbox
const SHEET = 'Enquiries';
// Explicit target also allows setup from a standalone project if Google's bound-editor link fails.
const SPREADSHEET_ID = '1vjkk2O3MbXuXeP0BF7AiShzQbOMH6aNljgxt6_FBPtk';
const COLUMNS = ['Received', 'Name', 'Gmail / email', 'Here for', 'WhatsApp', 'Channel', 'Message', 'From page'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.company) return reply_(true);                         // the hidden field: only bots fill it in
  const f = {
    name: clean_(p.name, 80), email: clean_(p.email, 120), whatsapp: clean_(p.whatsapp, 40), channel: clean_(p.channel, 200),
    needs: clean_(p.needs, 160) || 'Not said', message: clean_(p.message, 2000), page: clean_(p.page, 200),
  };
  if (!f.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return reply_(false);

  // 1. the contact list: one row per enquiry
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { sheet_().appendRow([new Date(), ...[f.name, f.email, f.needs, f.whatsapp, f.channel, f.message, f.page].map(cell_)]); }
  finally { lock.releaseLock(); }

  // 2. the email, to this account, with the person as reply-to
  const me = Session.getEffectiveUser().getEmail();
  const tag = Utilities.getUuid().slice(0, 6);                 // keeps each subject unique, so the label finds the right thread
  // who, their email and what they're here for, all in the subject: readable straight from the inbox list
  const subject = `New enquiry: ${f.name} (${f.email}), here for ${f.needs} [${tag}]`;
  const rows = [['Name', f.name], ['Gmail / email', f.email], ['Here for', f.needs], ['WhatsApp', f.whatsapp], ['Channel', f.channel], ['Message', f.message], ['Sent from', f.page]].filter(r => r[1]);
  const wa = f.whatsapp.replace(/[^\d]/g, '');
  const text = `${f.name} (${f.email}) is here for: ${f.needs}\n\n` + rows.map(r => `${r[0]}: ${r[1]}`).join('\n');
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
    <p style="margin:0 0 6px;font-size:17px"><b>${esc_(f.name)}</b> &lt;<a href="mailto:${esc_(f.email)}">${esc_(f.email)}</a>&gt;</p>
    <p style="margin:0 0 16px">Here for: <b>${esc_(f.needs)}</b></p>
    <table cellpadding="7" style="border-collapse:collapse">${rows.map(r => `<tr><td style="color:#666;vertical-align:top">${r[0]}</td><td>${esc_(r[1]).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>
    <p style="margin:16px 0 0">Reply to this email to answer ${esc_(f.name.split(' ')[0])}${wa ? `, or <a href="https://wa.me/${wa}">message them on WhatsApp</a>` : ''}.</p></div>`;
  GmailApp.sendEmail(me, subject, text, { htmlBody: html, replyTo: f.email, name: 'Cutsway website' });

  // 3. file it under the label
  file_(subject);
  return reply_(true);
}

// a quick check that the deployment is live: open the web app URL in a browser
function doGet() { return ContentService.createTextOutput('Cutsway enquiry form: live.'); }

// run once from the editor (Run → setup) to grant permissions and create the label and the sheet's header row
function setup() {
  const book = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Run setup from the Apps Script editor attached to your enquiry spreadsheet.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', book.getId());
  label_(); sheet_();
}

function file_(subject) {
  const label = label_();
  for (let n = 0; n < 6; n++) {                                // the sent message takes a moment to become searchable
    Utilities.sleep(1500);
    const threads = GmailApp.search(`subject:"${subject}"`, 0, 1);
    if (threads.length) { threads[0].addLabel(label); threads[0].markImportant(); if (SKIP_INBOX) threads[0].moveToArchive(); return; }
  }
}
function label_() { return GmailApp.getUserLabelByName(LABEL) || GmailApp.createLabel(LABEL); }
function sheet_() {
  // Web apps have no active spreadsheet: setup saves the bound file's ID once.
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Run setup once from the bound Apps Script editor before deploying.');
  const book = SpreadsheetApp.openById(id);
  const sh = book.getSheetByName(SHEET) || book.insertSheet(SHEET);
  if (sh.getLastRow() === 0) { sh.appendRow(COLUMNS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold'); }
  return sh;
}
function clean_(v, max) { return String(v || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max); }
// a value that starts like a formula is stored as text, so nothing typed into the form can run in the sheet
function cell_(v) { return /^[=+\-@]/.test(v) ? `'${v}` : v; }
function esc_(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function reply_(ok) { return ContentService.createTextOutput(JSON.stringify({ ok })).setMimeType(ContentService.MimeType.JSON); }
