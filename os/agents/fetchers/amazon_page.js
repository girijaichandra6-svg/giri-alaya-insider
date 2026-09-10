/**
 * Fetcher adapter — the ONLY place a live Amazon pull happens (Module 4).
 * If no adapter is configured, fetch() throws, and the caller marks fields
 * UNVERIFIED. Never returns fabricated data.
 *
 * Adapters, in priority order:
 *   a) Creators API (post-probation)
 *   b) Licensed scrape infra with a stable contract
 *   c) Manual paste from a human (last resort; requires page_hash for audit)
 */
export class AmazonPageFetcher {
  constructor(cfg = {}) { this.cfg = cfg; }

  async fetch(asin) {
    if (this.cfg.mode === 'creators')  return this._creators(asin);
    if (this.cfg.mode === 'scrape')    return this._scrape(asin);
    if (this.cfg.mode === 'manual')    return this._manual(asin);
    throw new Error('no_amazon_adapter_configured');
  }

  async _creators(asin) {
    // Wire to Creators API once probation clears. Structure ready; endpoint TBD.
    const r = await fetch(this.cfg.endpoint + '/items/' + asin, {
      headers: { 'authorization': 'Bearer ' + this.cfg.token }
    });
    if (!r.ok) throw new Error('creators_http_' + r.status);
    const d = await r.json();
    return {
      data: {
        title: d.title, brand: d.brand, price: Number(d.price),
        rating: Number(d.rating), review_count: Number(d.review_count)
      },
      source: this.cfg.endpoint + '/items/' + asin
    };
  }

  async _scrape(asin) {
    const r = await fetch(this.cfg.endpoint + '/' + asin, {
      headers: { 'x-api-key': this.cfg.key }
    });
    if (!r.ok) throw new Error('scrape_http_' + r.status);
    const d = await r.json();
    return {
      data: {
        title: d.title, brand: d.brand, price: Number(d.price),
        rating: Number(d.rating), review_count: Number(d.review_count)
      },
      source: this.cfg.endpoint + '/' + asin
    };
  }

  async _manual(asin) {
    const entry = (this.cfg.pasted || {})[asin];
    if (!entry) throw new Error('manual_entry_absent');
    return {
      data: {
        title: entry.title, brand: entry.brand, price: Number(entry.price),
        rating: Number(entry.rating), review_count: Number(entry.review_count)
      },
      source: 'manual://' + (entry.page_hash || 'unknown')
    };
  }
}
