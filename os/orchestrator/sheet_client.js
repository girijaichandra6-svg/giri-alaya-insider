/** All sheet I/O via Apps Script webhook. No direct Sheets API for writes (Module 14). */
export class SheetClient {
  constructor(cfg) {
    if (!cfg.sheetWebhook) throw new Error('SHEET_WEBHOOK_URL unset');
    if (!cfg.stateSecret)  throw new Error('STATE_WEBHOOK_SECRET unset');
    this.url = cfg.sheetWebhook;
    this.secret = cfg.stateSecret;
  }
  transition(p)         { return this._post({ action: 'transition',   ...p }); }
  getRow(sku)           { return this._post({ action: 'get_row',      sku }); }
  listRows(filters = {}) { return this._post({ action: 'list_rows',   ...filters }); }
  writeDecision(d)      { return this._post({ action: 'log_decision', ...d }); }
  getCost(sku)          { return this._post({ action: 'get_cost',     sku }); }
  addCost(sku, usd, n)  { return this._post({ action: 'add_cost',     sku, usd, note: n }); }

  async _post(body) {
    const r = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-alaya-secret': this.secret },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error('sheet_http_' + r.status);
    const j = await r.json().catch(() => ({}));
    if (j && j.error) throw new Error('sheet_err_' + j.error + (j.note ? ':' + j.note : ''));
    return j;
  }
}
