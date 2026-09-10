/**
 * Dashboard.gs — Owner's Dashboard — read-only summary.
 * Rebuilt hourly (and by menu action). Every value written by Apps Script from
 * authoritative tabs. UNVERIFIED where a source is unattached.
 */

function buildDashboardTab() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName('Dashboard');
  if (!sh) sh = ss.insertSheet('Dashboard', 0);      // place at front
  sh.clear();
  sh.setHiddenGridlines(true);

  const products = readProducts_();
  const pending  = products.filter(r => r.status === 'PENDING_APPROVAL');
  const counts   = countByStatus_(products);
  const props    = PropertiesService.getScriptProperties();

  const rows = [];
  const push = (...cells) => rows.push(cells);

  push('ALAYA INSIDER', '');
  push('', '');
  push('Today', Utilities.formatDate(new Date(),
      Session.getScriptTimeZone(), 'EEEE, MMM d yyyy  HH:mm'));
  push('', '');

  push('PIPELINE', '');
  push('Pending your approval', pending.length);
  push('In pipeline (non-terminal)',
       products.filter(r => ['DISCOVERED','SCORED','VERIFIED','RESEARCHED',
         'CREATIVES_READY','RENDERED','COMPLIANCE_PASS'].indexOf(r.status) !== -1).length);
  push('Published',   counts.PUBLISHED || 0);
  push('HOLD',        counts.HOLD || 0);
  push('PULLED',      counts.PULLED || 0);
  push('Rejected',    counts.REJECTED || 0);
  push('Killed',      counts.KILLED || 0);
  push('', '');

  push('PROBATION / API', '');
  push('Qualifying sales (30d)', 'UNVERIFIED');
  push('Probation countdown',    'UNVERIFIED');
  push('API active?',            'UNVERIFIED (0/3 sales)');
  push('', '');

  push('COST', '');
  push('Month to date',
       '$' + Number(props.getProperty('COST_MONTH_TO_DATE') || 0).toFixed(2));
  push('Monthly cap',       '$' + Number(props.getProperty('COST_MONTH_CAP_USD') || 2000).toFixed(2));
  push('Intake status',
       props.getProperty('INTAKE_FROZEN') === 'true' ? 'FROZEN' : 'open');
  push('', '');

  push('LAST 24 HOURS', '');
  push('Clicks',   'UNVERIFIED');
  push('Revenue',  'UNVERIFIED');
  push('EPC',      'UNVERIFIED');
  push('', '');

  push('ACTIVE RISK FLAGS', '');
  const flags = readOpenFlags_();
  if (!flags.length) push('—', '');
  flags.slice(0, 10).forEach(f => push(f.reason_code, f.note || ''));

  sh.getRange(1, 1, rows.length, 2).setValues(
    rows.map(r => [r[0] != null ? r[0] : '', r[1] != null ? r[1] : '']));

  // Styling
  sh.getRange(1, 1, 1, 2).setFontWeight('bold').setFontSize(14);
  sh.getRange('A1:B1').merge();
  sh.setColumnWidth(1, 260);
  sh.setColumnWidth(2, 380);

  const allVals = sh.getRange(1, 1, rows.length, 2).getValues();
  allVals.forEach((r, i) => {
    const a = String(r[0] || '');
    if (a && a === a.toUpperCase() && a.length > 2 && !/^\$/.test(a)) {
      sh.getRange(i + 1, 1, 1, 2).setFontWeight('bold').setBackground('#F2EDE7');
    }
  });

  sh.setFrozenRows(1);
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function readProducts_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  return sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues().map(r => {
    const o = {}; PRODUCTS_COLUMNS.forEach((c, j) => o[c] = r[j]); return o;
  });
}

function countByStatus_(products) {
  return products.reduce((a, p) => {
    const s = String(p.status || '').trim();
    if (s) a[s] = (a[s] || 0) + 1;
    return a;
  }, {});
}

function readOpenFlags_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.DECISIONS);
  if (!sh || sh.getLastRow() < 2) return [];
  const cutoff = Date.now() - 24 * 3600 * 1000;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, DECISIONS_COLUMNS.length).getValues();
  return vals.filter(r => {
    const ts = r[0];
    if (!(ts instanceof Date) || ts.getTime() < cutoff) return false;
    const dec = String(r[3] || '').toUpperCase();
    return dec === 'FLAG' || dec === 'VETO';
  }).map(r => ({ reason_code: String(r[4] || ''), note: String(r[5] || '').slice(0, 120) }));
}
