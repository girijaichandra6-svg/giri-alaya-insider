/** Price-history adapter (Keepa-class). Same contract as AmazonPageFetcher (Module 4). */
export class PriceHistoryFetcher {
  constructor(cfg = {}) { this.cfg = cfg; }

  async p30AndPrev(asin) {
    if (!this.cfg.endpoint || !this.cfg.key) throw new Error('no_history_adapter_configured');
    const r = await fetch(
      this.cfg.endpoint + '/product?key=' + encodeURIComponent(this.cfg.key) +
      '&domain=1&asin=' + asin,
      { headers: { 'accept': 'application/json' } }
    );
    if (!r.ok) throw new Error('history_http_' + r.status);
    const d = await r.json();
    return {
      data: {
        previous_price: Number(d.list_price || d.p30_min || d.last_non_promo || 0) || null,
        p30_12mo: Number(d.p30_12mo || 0) || null
      },
      source: this.cfg.endpoint + '/product?asin=' + asin
    };
  }
}
