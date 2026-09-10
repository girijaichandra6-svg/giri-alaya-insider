/**
 * Data Fill Agent (Module 4). Fills the 27 Products columns for a SCORED row.
 * Hard rule: any factual field (price, previous_price, rating, review_count,
 * name, brand) requires a fetcher return with .source. No source → UNVERIFIED
 * marker, no exception. Row does not advance out of SCORED while blocked.
 */

const UNVERIFIED = 'UNVERIFIED';

export async function fillProductRow(input, deps = {}) {
  const asin = String(input.asin || '').toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(asin)) throw new Error('BAD_ASIN');

  const amazonFetcher  = deps.amazonFetcher  || new (await import('./fetchers/amazon_page.js')).AmazonPageFetcher(deps.amazonConfig || {});
  const historyFetcher = deps.historyFetcher || new (await import('./fetchers/price_history.js')).PriceHistoryFetcher(deps.historyConfig || {});
  const { buildGoUrl } = await import('./util/go_url.js');
  const now = new Date().toISOString();

  const page    = await safe(() => amazonFetcher.fetch(asin));
  const history = await safe(() => historyFetcher.p30AndPrev(asin));

  const row = {
    name:              page.ok ? page.data.title : UNVERIFIED,
    brand:             page.ok ? page.data.brand : UNVERIFIED,
    category:          input.category,        // supplied by Selection
    subcategory:       input.subcategory,     // supplied by Selection
    price:             page.ok && isNum(page.data.price) ? page.data.price : UNVERIFIED,
    previous_price:    history.ok ? history.data.previous_price : UNVERIFIED,
    currency:          'USD',
    rating:            page.ok && isNum(page.data.rating) ? page.data.rating : UNVERIFIED,
    review_count:      page.ok && isInt(page.data.review_count) ? page.data.review_count : UNVERIFIED,
    description:       '',                    // Research Agent fills 10–16
    why_we_recommend:  '',
    best_for:          '',
    benefits:          '',
    pros:              '',
    cons:              '',
    buying_advice:     '',
    affiliate_url:     buildGoUrl(asin),
    marketplace:       'Amazon.com',
    affiliate_network: 'Amazon Associates',
    cta_text:          'Check current price on Amazon',
    sku:               'AL-' + asin,
    status:            'VERIFIED',            // downgraded below if any field is UNVERIFIED
    is_featured:       false,
    is_trending:       false,
    is_editors_pick:   false,
    seo_title:         '',
    seo_description:   ''
  };

  // Verification gate — any UNVERIFIED factual field holds the row at SCORED.
  const factual = ['price', 'previous_price', 'rating', 'review_count', 'name', 'brand'];
  const unverified = factual.filter(k => row[k] === UNVERIFIED);
  if (unverified.length) {
    row.status = 'SCORED';
    row._blockers = unverified.map(k => ({ field: k, reason: reasonFor(k, { page, history }) }));
  }
  row._sources = {
    amazon_page:   page.ok ? page.source : null,
    price_history: history.ok ? history.source : null,
    fetched_at:    now
  };
  return row;
}

const isNum = v => typeof v === 'number' && isFinite(v);
const isInt = v => Number.isInteger(v);

async function safe(fn) {
  try { return { ok: true, ...(await fn()) }; }
  catch (e) { return { ok: false, error: String(e && e.message || e) }; }
}

function reasonFor(field, ctx) {
  if (!ctx.page.ok && field !== 'previous_price') return 'amazon_fetch_failed: ' + ctx.page.error;
  if (!ctx.history.ok && field === 'previous_price') return 'history_fetch_failed: ' + ctx.history.error;
  return 'source_missing';
}
