/**
 * Notify.gs — compact daily email to the Owner at 9am project time.
 * Reads from authoritative tabs — no re-computation. Unattached sources
 * surface as UNVERIFIED rather than estimates.
 */

function sendDailyOwnerEmail() {
  const to = PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  if (!to) return;

  const ss = SpreadsheetApp.getActive();
  const webUrl = ss.getUrl();
  const products = readProducts_();
  const pending  = products.filter(r => r.status === 'PENDING_APPROVAL');
  const props    = PropertiesService.getScriptProperties();

  const lines = [];
  lines.push('<h2 style="font-family:Inter,Arial,sans-serif;color:#1A1A1A">Alaya Insider — Daily</h2>');
  lines.push('<p style="font-family:Inter,Arial,sans-serif;color:#444">' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'EEEE, MMM d yyyy') + '</p>');

  if (pending.length) {
    lines.push('<h3 style="font-family:Inter,Arial,sans-serif">⏳ ' + pending.length +
      ' awaiting your approval</h3>');
    lines.push('<ul style="font-family:Inter,Arial,sans-serif">');
    pending.slice(0, 15).forEach(r => {
      lines.push('<li><b>' + escapeHtml_(r.name || r.sku) + '</b> — ' +
        escapeHtml_(r.brand || '') + ' · $' + (r.price != null ? r.price : 'UNVERIFIED') +
        ' · ' + escapeHtml_(r.sku) + '</li>');
    });
    lines.push('</ul>');
    lines.push('<p style="font-family:Inter,Arial,sans-serif">' +
      '<a href="' + webUrl + '">Open the Sheet →</a></p>');
  } else {
    lines.push('<p style="font-family:Inter,Arial,sans-serif">No rows awaiting approval.</p>');
  }

  // Red flags from last 24h
  const flags = readOpenFlags_();
  if (flags.length) {
    lines.push('<h3 style="font-family:Inter,Arial,sans-serif">⚠️ Flags (24h)</h3>');
    lines.push('<ul style="font-family:Inter,Arial,sans-serif">');
    flags.slice(0, 8).forEach(f => lines.push('<li>' + escapeHtml_(f.reason_code) +
      (f.note ? ' — ' + escapeHtml_(f.note) : '') + '</li>'));
    lines.push('</ul>');
  }

  // Cost
  lines.push('<p style="font-family:Inter,Arial,sans-serif;color:#666">' +
    'Cost MTD: $' + Number(props.getProperty('COST_MONTH_TO_DATE') || 0).toFixed(2) +
    ' · Intake ' + (props.getProperty('INTAKE_FROZEN') === 'true' ? 'FROZEN' : 'open') + '</p>');

  lines.push('<p style="font-family:Inter,Arial,sans-serif;color:#888;font-size:12px">' +
    'As an Amazon Associate I earn from qualifying purchases.</p>');

  MailApp.sendEmail({
    to,
    subject: 'Alaya daily — ' + pending.length + ' pending approval',
    htmlBody: lines.join(''),
    name: 'Alaya Insider OS'
  });
}

function installDailyEmailTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'sendDailyOwnerEmail') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendDailyOwnerEmail').timeBased()
    .atHour(9).nearMinute(0).everyDays(1).create();
  // Set the project time zone to America/New_York in Project Settings
  // so this fires at 9am ET per the spec.
}

function installDashboardRebuildTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'buildDashboardTab') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('buildDashboardTab').timeBased().everyHours(1).create();
}

function escapeHtml_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
