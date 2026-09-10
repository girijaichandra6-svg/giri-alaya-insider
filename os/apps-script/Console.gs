/**
 * Console.gs — Owner's Console. Adds an "Alaya" menu to the Sheet.
 * Every action routes through applyStatusTransition_ from Guards.gs, so the
 * guard remains the single choke point. The menu never writes status cells directly.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Alaya')
    .addItem('📊 Open Dashboard',            'menuOpenDashboard')
    .addItem('⏳ Open Pending Approvals',    'menuOpenPending')
    .addItem('📋 Open Today\u2019s Digest',  'menuOpenDigest')
    .addSeparator()
    .addItem('✅ Approve selected rows',     'menuApproveSelected')
    .addItem('🚫 Reject selected rows…',     'menuRejectSelected')
    .addSeparator()
    .addItem('💰 Show cost burn',            'menuShowCost')
    .addItem('🧊 Freeze / unfreeze intake',  'menuToggleIntakeFreeze')
    .addItem('🔄 Rerun hourly monitors now', 'menuRerunHourly')
    .addSeparator()
    .addItem('🩺 Run integrity check',       'menuRunIntegrity')
    .addToUi();
}

function menuOpenDashboard()  { activateTab_('Dashboard'); }
function menuOpenPending()    { filterProductsByStatus_('PENDING_APPROVAL'); }
function menuOpenDigest()     { jumpToTodayDigest_(); }

function menuApproveSelected() {
  const ui = SpreadsheetApp.getUi();
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const sel = SpreadsheetApp.getActiveRange();
  if (!sel) return ui.alert('Select one or more rows in the Products tab first.');

  const rowIdxs = rowsFromSelection_(sel, sh);
  if (!rowIdxs.length) return ui.alert('No data rows selected.');

  const preview = rowIdxs.map(r => '• ' + sh.getRange(r, PRODUCTS_COL_IDX.sku).getValue() +
    ' — ' + sh.getRange(r, PRODUCTS_COL_IDX.name).getValue()).join('\n');
  const confirm = ui.alert('Approve ' + rowIdxs.length + ' row(s)?',
    preview + '\n\nThis advances each to APPROVED and unlocks publishing.',
    ui.ButtonSet.YES_NO);
  if (confirm !== ui.Button.YES) return;

  let ok = 0, blocked = 0; const reasons = [], progress = [];
  rowIdxs.forEach(r => {
    const sku  = String(sh.getRange(r, PRODUCTS_COL_IDX.sku).getValue()).trim();
    const from = String(sh.getRange(r, PRODUCTS_COL_IDX.status).getValue()).trim();
    if (from !== 'PENDING_APPROVAL') {
      blocked++; reasons.push(sku + ' — not in PENDING_APPROVAL (currently ' + from + ')'); return;
    }
    try {
      applyStatusTransition_(sh, r, sku, from, 'APPROVED', 'OWNER');
      ok++; progress.push(sku + ' → APPROVED');
    } catch (e) {
      blocked++; reasons.push(sku + ' — ' + (e.message || 'unknown'));
    }
  });
  initializeStatusSnapshot_();

  ui.alert('Approve complete',
    ok + ' approved · ' + blocked + ' blocked\n\n' +
    progress.slice(0, 15).join('\n') +
    (reasons.length ? '\n\nBlocked:\n' + reasons.slice(0, 10).join('\n') : ''),
    ui.ButtonSet.OK);
}

function menuRejectSelected() {
  const ui = SpreadsheetApp.getUi();
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const sel = SpreadsheetApp.getActiveRange();
  if (!sel) return ui.alert('Select one or more rows in the Products tab first.');
  const rowIdxs = rowsFromSelection_(sel, sh);
  if (!rowIdxs.length) return ui.alert('No data rows selected.');

  const menu = Object.keys(REJECT_CODES).map(c => c + ' — ' + REJECT_CODES[c]).join('\n');
  const r = ui.prompt('Reject ' + rowIdxs.length + ' row(s). Pick a code (C1–C15).',
    menu + '\n\nCode:', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const code = r.getResponseText().trim().toUpperCase();
  if (!REJECT_CODES[code]) return ui.alert('Not a valid code: ' + code);

  let ok = 0;
  rowIdxs.forEach(row => {
    const sku  = String(sh.getRange(row, PRODUCTS_COL_IDX.sku).getValue()).trim();
    const from = String(sh.getRange(row, PRODUCTS_COL_IDX.status).getValue()).trim();
    if (['PENDING_APPROVAL','HOLD','SCORED','VERIFIED','RESEARCHED',
         'CREATIVES_READY','RENDERED','COMPLIANCE_PASS','DISCOVERED'].indexOf(from) === -1) return;
    try {
      applyStatusTransition_(sh, row, sku, from, 'REJECTED', 'OWNER');
      logDecision_(sku, 'OWNER', 'REJECT', code, REJECT_CODES[code]);
      ok++;
    } catch (_) {}
  });
  initializeStatusSnapshot_();
  ui.alert('Rejected ' + ok + ' row(s) · code ' + code);
}

function menuShowCost() {
  const props = PropertiesService.getScriptProperties();
  const cap   = Number(props.getProperty('COST_MONTH_CAP_USD') || 2000);
  const spend = Number(props.getProperty('COST_MONTH_TO_DATE') || 0);
  const pct   = cap > 0 ? Math.round(spend / cap * 100) : 0;
  SpreadsheetApp.getUi().alert('Cost burn',
    'Month to date: $' + spend.toFixed(2) + ' / $' + cap.toFixed(2) + ' (' + pct + '%)\n' +
    'Per-ASIN cap: $8.00\n' +
    'Intake ' + (props.getProperty('INTAKE_FROZEN') === 'true' ? 'FROZEN' : 'open'),
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuToggleIntakeFreeze() {
  const props = PropertiesService.getScriptProperties();
  const cur   = props.getProperty('INTAKE_FROZEN') === 'true';
  props.setProperty('INTAKE_FROZEN', cur ? 'false' : 'true');
  SpreadsheetApp.getUi().alert('Intake ' + (cur ? 'resumed' : 'frozen'));
}

function menuRerunHourly() {
  const alerts = [];
  try { pollStatusDrift(); } catch (e) { alerts.push('poller: ' + e.message); }
  try { hourlyIntegrityCheck(); } catch (e) { alerts.push('integrity: ' + e.message); }
  try { buildDashboardTab(); } catch (e) { alerts.push('dashboard: ' + e.message); }
  SpreadsheetApp.getUi().alert('Monitors run',
    alerts.length ? alerts.join('\n') : 'Poller, integrity check and dashboard rebuild completed.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuRunIntegrity() { menuRerunHourly(); }

/* ── helpers ──────────────────────────────────────────────────────────── */

function rowsFromSelection_(sel, sh) {
  const startRow = Math.max(2, sel.getRow());
  const numRows  = sel.getNumRows();
  const out = [];
  for (let i = 0; i < numRows; i++) {
    const r = startRow + i;
    if (r === 1) continue;
    if (String(sh.getRange(r, PRODUCTS_COL_IDX.sku).getValue()).trim()) out.push(r);
  }
  return out;
}

function activateTab_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return SpreadsheetApp.getUi().alert('Tab "' + name + '" missing.');
  SpreadsheetApp.getActive().setActiveSheet(sh);
  sh.activate();
}

function filterProductsByStatus_(status) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return activateTab_(SHEET_NAMES.PRODUCTS);
  const range = sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length);
  const existing = range.getFilter();
  if (existing) existing.remove();
  const filter = range.createFilter();
  filter.setColumnFilterCriteria(
    PRODUCTS_COL_IDX.status,
    SpreadsheetApp.newFilterCriteria()
      .whenTextEqualTo(status)
      .build());
  sh.getRange(1, PRODUCTS_COL_IDX.status).activate();
  activateTab_(SHEET_NAMES.PRODUCTS);
}

function jumpToTodayDigest_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.DIGEST);
  if (!sh || sh.getLastRow() < 2) return activateTab_(SHEET_NAMES.DIGEST);
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  let targetRow = sh.getLastRow();
  for (let i = vals.length - 1; i >= 0; i--) {
    const d = vals[i][0] instanceof Date
      ? Utilities.formatDate(vals[i][0], Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(vals[i][0]).slice(0, 10);
    if (d <= today) { targetRow = i + 2; break; }
  }
  activateTab_(SHEET_NAMES.DIGEST);
  sh.getRange(targetRow, 1).activate();
}
