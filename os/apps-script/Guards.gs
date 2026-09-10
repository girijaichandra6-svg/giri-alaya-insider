/** Guards.gs — status state machine, onEdit handler, poller, integrity check. */

function onEditInstallable(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (sh.getName() !== SHEET_NAMES.PRODUCTS) return;
  const sc = PRODUCTS_COL_IDX.status;
  if (sc < e.range.getColumn() || sc >= e.range.getColumn() + e.range.getNumCols()) return;

  const rows   = e.range.getNumRows();
  const first  = e.range.getRow();
  const single = (rows === 1 && e.range.getNumCols() === 1);
  const actor  = resolveActor_(e);

  const skus   = sh.getRange(first, PRODUCTS_COL_IDX.sku, rows, 1).getValues().map(r => String(r[0]||'').trim());
  const next   = sh.getRange(first, sc, rows, 1).getValues().map(r => String(r[0]||'').trim());

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) { safeToast_('Lock timeout — retry.'); return; }
  try {
    for (let i = 0; i < rows; i++) {
      const r = first + i;
      if (r === 1) continue;
      const from = single ? String(e.oldValue || '') : snapshotStatus_(skus[i]);
      applyStatusTransition_(sh, r, skus[i], from, next[i], actor);
    }
    initializeStatusSnapshot_();
  } finally { lock.releaseLock(); }
}

function resolveActor_(e) {
  let email = '';
  try { email = (e && e.user && e.user.getEmail && e.user.getEmail()) || ''; } catch (_) {}
  if (!email) { try { email = Session.getActiveUser().getEmail(); }    catch (_) {} }
  if (!email) { try { email = Session.getEffectiveUser().getEmail(); } catch (_) {} }
  const map = JSON.parse(PropertiesService.getScriptProperties().getProperty('ROLE_BY_EMAIL') || '{}');
  return map[(email || '').toLowerCase()] || 'SYSTEM';
}

function snapshotStatus_(sku) {
  const s = JSON.parse(PropertiesService.getScriptProperties().getProperty('STATUS_SNAPSHOT') || '{}');
  return (s[sku] && s[sku].status) || '';
}

function applyStatusTransition_(sh, row, sku, fromRaw, toRaw, actor) {
  const from = String(fromRaw || '').trim().toUpperCase();
  const to   = String(toRaw   || '').trim().toUpperCase();
  if (to === from) return;
  const cell = sh.getRange(row, PRODUCTS_COL_IDX.status);

  if (STATUS_ENUM.indexOf(to) === -1) {
    cell.setValue(from);
    logDecision_(sku, actor, 'VETO', 'INVALID_STATUS_ENUM', 'Unknown status "' + to + '"');
    safeToast_('Invalid status: ' + to);
    return;
  }

  const verdict = checkTransition_(from, to, actor, sku);
  if (!verdict.ok) {
    cell.setValue(from);
    logDecision_(sku, actor, 'VETO', verdict.code, verdict.note);
    safeToast_('Blocked ' + from + ' → ' + to + ' (' + verdict.note + ')');
    return;
  }

  if (to === 'REJECTED') {
    const code = promptRejectReason_();
    if (!code) { cell.setValue(from); safeToast_('Rejection needs C1–C15.'); return; }
    logDecision_(sku, actor, 'REJECT', code, 'transition ' + from + ' → ' + to);
  } else {
    logDecision_(sku, actor, decisionCode_(to), '', 'transition ' + from + ' → ' + to);
  }

  if (to === 'HOLD')     storeProp_('hold_from_'   + sku, from);
  if (to === 'PULLED')   storeProp_('pulled_from_' + sku, from);
  if (from === 'HOLD')   deleteProp_('hold_from_'   + sku);
  if (from === 'PULLED') deleteProp_('pulled_from_' + sku);

  if (to === 'APPROVED') onRowApproved_(sku);
}

function checkTransition_(from, to, actor, sku) {
  const row = TRANSITIONS[from];
  if (row && row[to] && row[to].indexOf(actor) !== -1) return {ok:true};

  if (from === 'HOLD') {
    if (actor !== 'CEO') return {ok:false, code:'HOLD_UNHOLD_ACTOR', note:'un-HOLD is CEO-only'};
    const prev = getProp_('hold_from_' + sku);
    if (to === prev) return {ok:true};
    if (['KILLED','REJECTED','EXPIRED','PULLED'].indexOf(to) !== -1) return {ok:true};
    return {ok:false, code:'HOLD_UNHOLD_TARGET', note:'un-HOLD must return to ' + prev + ' or a terminal'};
  }
  if (from === 'PULLED') {
    const prev = getProp_('pulled_from_' + sku);
    if (to === prev) return {ok:true};
    if (['KILLED','REJECTED','EXPIRED'].indexOf(to) !== -1) return {ok:true};
    return {ok:false, code:'PULLED_RESTORE_TARGET', note:'PULLED restores to ' + prev + ' or a terminal'};
  }
  if (!row || !row[to]) return {ok:false, code:'ILLEGAL_TRANSITION', note:from + ' → ' + to};
  return {ok:false, code:'ACTOR_NOT_AUTHORIZED', note:actor + ' cannot set ' + to + ' from ' + from};
}

function decisionCode_(to) {
  return ({APPROVED:'APPROVE', REJECTED:'REJECT', HOLD:'HOLD',
           PULLED:'PULL', KILLED:'KILL'})[to] || 'ADVANCE';
}

function logDecision_(sku, actor, decision, reasonCode, note) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.DECISIONS);
  if (!sh) return;
  sh.appendRow([new Date(), sku || '', actor, decision, reasonCode || '', String(note || '').slice(0,500), '']);
}

function promptRejectReason_() {
  const ui = SpreadsheetApp.getUi();
  const menu = Object.keys(REJECT_CODES).map(c => c + ' — ' + REJECT_CODES[c]).join('\n');
  const r = ui.prompt('Reject reason (C1–C15)', menu + '\n\nEnter code:', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return '';
  const code = r.getResponseText().trim().toUpperCase();
  return REJECT_CODES[code] ? code : '';
}

/* ── 5-minute poller: fallback for writes that bypass onEdit ── */
function pollStatusDrift() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  const sc = PRODUCTS_COL_IDX.status, kc = PRODUCTS_COL_IDX.sku;

  const now = {};
  sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues().forEach((r, i) => {
    const sku = String(r[kc - 1] || '').trim();
    if (!sku) return;
    now[sku] = {status: String(r[sc - 1] || '').trim(), row: i + 2};
  });

  const props = PropertiesService.getScriptProperties();
  const prev  = JSON.parse(props.getProperty('STATUS_SNAPSHOT') || '{}');

  Object.keys(now).forEach(sku => {
    const p = prev[sku];
    if (!p || p.status === now[sku].status) return;
    if (hasDecisionIn_LastMinutes(sku, 12)) return;

    if (now[sku].status === 'APPROVED') {
      // Fatal-class event: only Owner may approve. Hard revert.
      sh.getRange(now[sku].row, sc).setValue('PENDING_APPROVAL');
      logDecision_(sku, 'SYSTEM', 'VETO', 'UNKNOWN_APPROVAL',
        'Non-owner APPROVED reverted → PENDING_APPROVAL (poller)');
      now[sku].status = 'PENDING_APPROVAL';
    } else {
      logDecision_(sku, 'SYSTEM', 'FLAG', 'STATUS_DRIFT',
        'Un-logged status change ' + p.status + ' → ' + now[sku].status + ' (poller)');
    }
  });
  props.setProperty('STATUS_SNAPSHOT', JSON.stringify(now));
}

function hasDecisionIn_LastMinutes(sku, minutes) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.DECISIONS);
  if (!sh || sh.getLastRow() < 2) return false;
  const cutoff = Date.now() - minutes * 60000;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, DECISIONS_COLUMNS.length).getValues();
  for (let i = vals.length - 1; i >= 0; i--) {
    const ts = vals[i][0];
    if (vals[i][1] !== sku) continue;
    if (ts instanceof Date && ts.getTime() >= cutoff) return true;
  }
  return false;
}

/* ── hourly integrity check: header, enum, duplicate SKU ── */
function hourlyIntegrityCheck() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const header = sh.getRange(1, 1, 1, PRODUCTS_COLUMNS.length).getValues()[0];
  if (!(header.length === PRODUCTS_COLUMNS.length && PRODUCTS_COLUMNS.every((h, i) => header[i] === h))) {
    logDecision_('', 'SYSTEM', 'FLAG', 'SHEET_HEADER_TAMPERED', 'Products header row changed or re-ordered');
  }
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  const vals = sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues();
  const seen = {}, dupes = [], bad = [];
  vals.forEach((r, i) => {
    const sku = String(r[PRODUCTS_COL_IDX.sku - 1] || '').trim();
    const st  = String(r[PRODUCTS_COL_IDX.status - 1] || '').trim();
    if (sku) { if (seen[sku]) dupes.push(sku); seen[sku] = true; }
    if (st && STATUS_ENUM.indexOf(st) === -1) bad.push('r' + (i + 2) + ':' + sku + '=' + st);
  });
  if (dupes.length) logDecision_('', 'SYSTEM', 'FLAG', 'DUPLICATE_SKU', dupes.slice(0, 8).join(','));
  if (bad.length)   logDecision_('', 'SYSTEM', 'FLAG', 'INVALID_STATUS_IN_SHEET', bad.slice(0, 8).join(' | '));
}

/* ── property helpers + toast ── */
function storeProp_(k, v) { PropertiesService.getScriptProperties().setProperty(k, v); }
function getProp_(k)      { return PropertiesService.getScriptProperties().getProperty(k) || ''; }
function deleteProp_(k)   { PropertiesService.getScriptProperties().deleteProperty(k); }
function safeToast_(m)    { try { SpreadsheetApp.getActive().toast(m, 'ALAYA OS', 6); } catch (_) {} }
