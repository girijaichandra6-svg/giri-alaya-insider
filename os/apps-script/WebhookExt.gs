/**
 * WebhookExt.gs — extends doPost to accept orchestrator state mutations and queries.
 * Two secrets: GO_WEBHOOK_SECRET for clicks; STATE_WEBHOOK_SECRET for state.
 * NOTE: this project's single doPost is defined here; Webhook.gs keeps its helpers
 * (handleClick / handleLinkHealth) but its doPost is superseded by this one.
 *
 * Web App must be deployed Access:"Anyone", Execute as:"Me".
 */

// eslint-disable-next-line no-redeclare
function doPost(e) {
  const body = parseBody_(e);
  const sent = (e.headers && (e.headers['x-alaya-secret'] || e.headers['X-Alaya-Secret'])) || '';
  const clickSecret = PropertiesService.getScriptProperties().getProperty('GO_WEBHOOK_SECRET')    || '';
  const stateSecret = PropertiesService.getScriptProperties().getProperty('STATE_WEBHOOK_SECRET') || '';

  // Backward compat — clicks and link_health route to the Module 2 handler.
  if (!body || !body.action) {
    if (sent && sent === clickSecret) return handleClickOrHealth_(e, body);
    return jsonOut_({ error: 'bad_request' });
  }
  if (sent !== stateSecret) return jsonOut_({ error: 'unauthorized' });

  switch (body.action) {
    case 'transition':   return jsonOut_(handleTransition_(body));
    case 'get_row':      return jsonOut_(getRowPublic_(body.sku));
    case 'list_rows':    return jsonOut_(listRowsPublic_(body));
    case 'log_decision': return jsonOut_(logDecisionPublic_(body));
    case 'get_cost':     return jsonOut_({ cost: getCostPublic_(body.sku) });
    case 'add_cost':     return jsonOut_(addCostPublic_(body.sku, body.usd, body.note));
    default: return jsonOut_({ error: 'unknown_action' });
  }
}

function handleClickOrHealth_(e, body) {
  const ss = SpreadsheetApp.getActive();
  if (body && body.kind === 'link_health' && Array.isArray(body.results)) {
    handleLinkHealth(ss, body.results);
  } else if (body) {
    handleClick(ss, body);
  }
  return jsonOut_({ ok: true });
}

function handleTransition_(b) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return { error: 'no_rows' };

  const kc = PRODUCTS_COL_IDX.sku, sc = PRODUCTS_COL_IDX.status;
  const vals = sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues();
  const role = actorRole_(b.actor);

  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][kc - 1]).trim() !== b.sku) continue;
    const row  = i + 2;
    const from = String(vals[i][sc - 1]).trim();
    if (from !== b.from) return { error: 'state_mismatch', current: from };

    // Absolute owner-gate check on the sheet side, regardless of who calls.
    if (b.to === 'APPROVED' && role !== 'OWNER') {
      logDecision_(b.sku, 'SYSTEM', 'VETO', 'NON_OWNER_APPROVE_ATTEMPT', '');
      return { error: 'non_owner_approve' };
    }

    const check = checkTransition_(b.from, b.to, role, b.sku);
    if (!check.ok) {
      logDecision_(b.sku, role, 'VETO', check.code, check.note);
      return { error: check.code, note: check.note };
    }

    sh.getRange(row, sc).setValue(b.to);
    logDecision_(b.sku, role, decisionCode_(b.to), '', b.note || '');
    if (b.to === 'APPROVED') onRowApproved_(b.sku);
    return { ok: true, sku: b.sku, now: b.to };
  }
  return { error: 'sku_not_found' };
}

function getRowPublic_(sku) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow(); if (lastRow < 2) return null;
  const kc = PRODUCTS_COL_IDX.sku;
  const vals = sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues();
  for (const r of vals) if (String(r[kc - 1]).trim() === sku) {
    const obj = {}; PRODUCTS_COLUMNS.forEach((c, j) => obj[c] = r[j]); return obj;
  }
  return null;
}

function listRowsPublic_(filters) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow(); if (lastRow < 2) return [];
  const vals = sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues();
  return vals.filter(r => {
    if (filters.asin  && String(r[PRODUCTS_COL_IDX.sku - 1]).trim() !== 'AL-' + filters.asin) return false;
    if (filters.status) {
      const wanted = Array.isArray(filters.status) ? filters.status : [filters.status];
      if (!wanted.includes(String(r[PRODUCTS_COL_IDX.status - 1]).trim())) return false;
    }
    return true;
  }).map(r => { const o = {}; PRODUCTS_COLUMNS.forEach((c, j) => o[c] = r[j]); return o; });
}

function logDecisionPublic_(d) {
  logDecision_(d.sku, d.actor, d.decision, d.reason_code, d.note);
  return { ok: true };
}

function getCostPublic_(sku) {
  const sh = SpreadsheetApp.getActive().getSheetByName('Costs');
  if (!sh || sh.getLastRow() < 2) return 0;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  return vals.filter(r => r[0] === sku).reduce((a, r) => a + Number(r[1] || 0), 0);
}

function addCostPublic_(sku, usd, note) {
  let sh = SpreadsheetApp.getActive().getSheetByName('Costs');
  if (!sh) {
    sh = SpreadsheetApp.getActive().insertSheet('Costs');
    sh.getRange(1, 1, 1, 3).setValues([['sku', 'usd', 'note']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  sh.appendRow([sku, Number(usd) || 0, note || '']);
  return { ok: true };
}

function actorRole_(email) {
  const map = JSON.parse(PropertiesService.getScriptProperties().getProperty('ROLE_BY_EMAIL') || '{}');
  return map[String(email || '').toLowerCase()] || 'SYSTEM';
}

function parseBody_(e) { try { return JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (_) { return null; } }
function jsonOut_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once: sets the state secret the orchestrator will use. */
function setStateSecret(value) {
  PropertiesService.getScriptProperties().setProperty('STATE_WEBHOOK_SECRET', value || '');
}
