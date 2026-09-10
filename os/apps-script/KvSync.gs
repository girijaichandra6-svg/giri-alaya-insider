/** KvSync.gs — keep ASIN_MAP in KV aligned with Products (Module 2).
 *  Needs three Script Properties set once: CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN.
 *  Install a 15-minute time trigger on syncAsinMapToKv (Setup does this when props are set).
 */

function syncAsinMapToKv() {
  const props = PropertiesService.getScriptProperties();
  const acct  = props.getProperty('CF_ACCOUNT_ID');
  const nsId  = props.getProperty('CF_KV_NAMESPACE_ID');
  const tok   = props.getProperty('CF_API_TOKEN');
  if (!acct || !nsId || !tok) return;

  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;

  const vals = sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues();
  vals.forEach(r => {
    const sku    = String(r[PRODUCTS_COL_IDX.sku    - 1] || '').trim();
    const status = String(r[PRODUCTS_COL_IDX.status - 1] || '').trim().toLowerCase();
    const url    = String(r[PRODUCTS_COL_IDX.affiliate_url - 1] || '').trim();
    if (!sku || !url) return;
    const m = url.match(/\/go\/([A-Za-z0-9]{10})$/);
    if (!m) return;
    const asin = m[1].toUpperCase();
    const payload = JSON.stringify({
      sku,
      status: mapKvStatus(status),   // active | pulled | expired
      updated_at: new Date().toISOString()
    });
    const endpoint = 'https://api.cloudflare.com/client/v4/accounts/' + acct +
      '/storage/kv/namespaces/' + nsId + '/values/' + asin;
    try {
      UrlFetchApp.fetch(endpoint, {
        method: 'put',
        headers: { 'Authorization': 'Bearer ' + tok },
        contentType: 'application/json',
        payload,
        muteHttpExceptions: true
      });
    } catch (_) {}
  });
}

function mapKvStatus(productStatus) {
  switch (productStatus) {
    case 'pulled':   return 'pulled';
    case 'expired':  return 'expired';
    case 'killed':   return 'pulled';
    case 'rejected': return 'pulled';
    default:         return 'active';
  }
}

/** Sheet-side hourly link probe — belt and braces vs the Cloudflare cron. */
function linkHealthCheck() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAMES.PRODUCTS);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  const vals = sh.getRange(2, 1, lastRow - 1, PRODUCTS_COLUMNS.length).getValues();
  const out = [];
  vals.forEach(r => {
    const sku  = String(r[PRODUCTS_COL_IDX.sku - 1] || '').trim();
    const url  = String(r[PRODUCTS_COL_IDX.affiliate_url - 1] || '').trim();
    const status = String(r[PRODUCTS_COL_IDX.status - 1] || '').trim();
    if (!sku || !url || ['PUBLISHED','APPROVED','PENDING_APPROVAL','MONITORING'].indexOf(status) === -1) return;
    try {
      const resp = UrlFetchApp.fetch(url, { method: 'get', followRedirects: false, muteHttpExceptions: true });
      const loc  = resp.getHeaders()['Location'] || resp.getHeaders()['location'] || '';
      const ok   = resp.getResponseCode() === 302 &&
        /^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?/.test(loc) &&
        !/bit\.ly|t\.co|tinyurl|ow\.ly|buff\.ly|amzn\.to/i.test(loc);
      out.push({ asin: sku.replace(/^AL-/, ''), status: resp.getResponseCode(), ok, reason: ok ? '' : 'bad_redirect', location: loc });
    } catch (e) {
      out.push({ asin: sku.replace(/^AL-/, ''), status: 0, ok: false, reason: 'fetch_error: ' + e, location: '' });
    }
  });
  if (out.length) handleLinkHealth(SpreadsheetApp.getActive(), out);
}
