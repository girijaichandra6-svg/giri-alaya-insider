/** Setup.gs — one-time build. Safe to re-run (idempotent). */

function buildProductOS() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(COLUMNS_BY_SHEET).forEach(n => ensureTab_(ss, n, COLUMNS_BY_SHEET[n]));
  ensureSchemaVersionNote_(ss);
  applyProductValidations_(ss);
  applyProductsProtections_(ss);
  installTriggers_();
  initializeStatusSnapshot_();
  ss.toast('Product OS build complete. Run configureActors(...) next.', 'ALAYA OS', 8);
}

function ensureTab_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const cur = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), headers.length)).getValues()[0];
  const matches = headers.every((h, i) => cur[i] === h) && !cur[headers.length];
  if (!matches) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  const extra = sh.getLastColumn() - headers.length;
  if (extra > 0) sh.getRange(1, headers.length + 1, sh.getMaxRows(), extra).clearContent();
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#EFEFEF');
}

function ensureSchemaVersionNote_(ss) {
  const sh = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  sh.getRange('A1').setNote('Schema v' + SCHEMA_VERSION +
    ' | columns=' + PRODUCTS_COLUMNS.length +
    ' | OWNER RULING: enumerated table authoritative → 27 columns');
}

function applyProductValidations_(ss) {
  const sh = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  const N  = Math.max(sh.getMaxRows(), 1000);
  const rule = vals => SpreadsheetApp.newDataValidation()
    .requireValueInList(vals, true).setAllowInvalid(false).build();

  sh.getRange(2, PRODUCTS_COL_IDX.status,     N - 1, 1).setDataValidation(rule(STATUS_ENUM));
  sh.getRange(2, PRODUCTS_COL_IDX.category,   N - 1, 1).setDataValidation(rule(CATEGORY_ENUM));
  sh.getRange(2, PRODUCTS_COL_IDX.currency,   N - 1, 1).setDataValidation(rule(['USD']));
  const allSubs = Object.keys(SUBCATEGORY_BY_CATEGORY)
    .reduce((a, k) => a.concat(SUBCATEGORY_BY_CATEGORY[k]), []);
  sh.getRange(2, PRODUCTS_COL_IDX.subcategory, N - 1, 1).setDataValidation(rule(allSubs));

  ['is_featured','is_trending','is_editors_pick'].forEach(c => {
    sh.getRange(2, PRODUCTS_COL_IDX[c], N - 1, 1)
      .setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  });
  sh.getRange(2, PRODUCTS_COL_IDX.price,     N - 1, 2).setNumberFormat('0.00');
  sh.getRange(2, PRODUCTS_COL_IDX.rating,    N - 1, 1).setNumberFormat('0.0');
  sh.getRange(2, PRODUCTS_COL_IDX.previous_price, N - 1, 1).setNumberFormat('0.00');
}

function applyProductsProtections_(ss) {
  const sh = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  sh.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(p => {
    try { p.remove(); } catch (_) {}
  });
  const sa   = PropertiesService.getScriptProperties().getProperty('PIPELINE_SA_EMAIL') || '';
  const N    = sh.getMaxRows();
  const last = PRODUCTS_COLUMNS.length;
  const sc   = PRODUCTS_COL_IDX.status;

  const lock = (rng, desc) => {
    const p = rng.protect().setDescription(desc);
    p.getEditors().forEach(u => p.removeEditor(u));
    if (sa) p.addEditor(sa);
  };
  lock(sh.getRange(1, 1, N, sc - 1),                     'Products: cols 1..' + (sc - 1) + ' (pipeline only)');
  if (sc < last) lock(sh.getRange(1, sc + 1, N, last - sc), 'Products: cols ' + (sc + 1) + '..' + last + ' (pipeline only)');
  // Status column intentionally writable by Owner AND pipeline.
}

function installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['onEditInstallable','pollStatusDrift','hourlyIntegrityCheck','syncAsinMapToKv']
          .indexOf(t.getHandlerFunction()) !== -1) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onEditInstallable').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  ScriptApp.newTrigger('pollStatusDrift').timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger('hourlyIntegrityCheck').timeBased().everyHours(1).create();
}

function initializeStatusSnapshot_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const snap = {}; const lastRow = sh.getLastRow();
  if (lastRow >= 2) {
    sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues().forEach(r => {
      const sku = String(r[PRODUCTS_COL_IDX.sku - 1] || '').trim();
      const st  = String(r[PRODUCTS_COL_IDX.status - 1] || '').trim();
      if (sku) snap[sku] = {status: st};
    });
  }
  PropertiesService.getScriptProperties().setProperty('STATUS_SNAPSHOT', JSON.stringify(snap));
}

/** Run once from the Apps Script editor with the three real addresses. */
function configureActors(ownerEmail, ceoEmail, pipelineEmail) {
  const map = {};
  if (ownerEmail)    map[ownerEmail.toLowerCase()]    = 'OWNER';
  if (ceoEmail)      map[ceoEmail.toLowerCase()]      = 'CEO';
  if (pipelineEmail) map[pipelineEmail.toLowerCase()] = 'PIPELINE';
  const props = PropertiesService.getScriptProperties();
  props.setProperty('ROLE_BY_EMAIL', JSON.stringify(map));
  props.setProperty('PIPELINE_SA_EMAIL', pipelineEmail || '');
}
