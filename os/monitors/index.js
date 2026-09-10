/**
 * Continuous monitors (Module 11). Each is a pure-ish async function; the caller
 * wires them to timers. Events are applied by the orchestrator through the sheet guard.
 */
export const MONITORS = {
  price_drift:       priceDrift,
  stock:             stockMonitor,
  asin_health:       asinHealth,
  rating_drift:      ratingDrift,
  link_health:       linkHealth,
  api_access_health: apiAccessHealth,
  cost_burn:         costBurn,
  freshness_sla:     freshnessSla,
  compliance_crawl:  complianceCrawl,
  metrics_recon:     metricsRecon
};

/** Hourly, PUBLISHED rows only. >10% vs trial price → PULLED. */
async function priceDrift(ctx) {
  const rows = await ctx.listProducts({ status: 'PUBLISHED' });
  const events = [];
  for (const r of rows) {
    const live = await ctx.fetchLivePrice(r.sku);
    if (live == null) { events.push({ sku: r.sku, action: 'FLAG', reason: 'live_price_unavailable' }); continue; }
    await ctx.writePrice(r.sku, live.price, r.price);
    const trial = Number(r.price);
    if (!trial) continue;
    const pct = Math.abs((live.price - trial) / trial) * 100;
    if (pct > 10) events.push({ sku: r.sku, action: 'PULL', reason: `price_drift_${pct.toFixed(1)}%`, newPrice: live.price });
  }
  return events;
}

/** Hourly. OOS → PULLED; auto-restore on return if row was pulled-for-OOS. */
async function stockMonitor(ctx) {
  const rows = await ctx.listProducts({ status: ['PUBLISHED', 'PULLED'] });
  const events = [];
  for (const r of rows) {
    const live = await ctx.fetchLiveStock(r.sku);
    if (live == null) continue;
    if (r.status === 'PUBLISHED' && !live.inStock) events.push({ sku: r.sku, action: 'PULL', reason: 'out_of_stock' });
    if (r.status === 'PULLED' && live.inStock && ctx.pulledReason(r.sku) === 'out_of_stock')
      events.push({ sku: r.sku, action: 'RESTORE', reason: 'back_in_stock' });
  }
  return events;
}

/** Daily. Merge/discontinue → PULLED. */
async function asinHealth(ctx) {
  const rows = await ctx.listProducts({ status: ['PUBLISHED', 'MONITORING'] });
  const events = [];
  for (const r of rows) {
    const h = await ctx.checkAsin(r.sku);
    if (!h.alive) events.push({ sku: r.sku, action: 'PULL', reason: 'asin_dead_' + (h.reason || 'unknown') });
    if (h.mergedInto && h.mergedInto !== r.sku) events.push({ sku: r.sku, action: 'PULL', reason: 'asin_merged_into_' + h.mergedInto });
  }
  return events;
}

/** Daily. Rating drop > 0.3 → HOLD + re-research. */
async function ratingDrift(ctx) {
  const rows = await ctx.listProducts({ status: ['PUBLISHED', 'MONITORING'] });
  const events = [];
  for (const r of rows) {
    const live = await ctx.fetchLiveRating(r.sku);
    if (live == null || r.rating == null) continue;
    if (Number(r.rating) - Number(live.rating) > 0.3)
      events.push({ sku: r.sku, action: 'HOLD', reason: `rating_drop_${(Number(r.rating) - Number(live.rating)).toFixed(2)}` });
  }
  return events;
}

/** Hourly. Broken affiliate_url or /go/ → alert + PULLED. */
async function linkHealth(ctx) {
  const rows = await ctx.listProducts({ status: ['PUBLISHED', 'APPROVED', 'PENDING_APPROVAL'] });
  const events = [];
  for (const r of rows) {
    const res = await ctx.fetchHead(r.affiliate_url);
    const loc = res.headers.get('location') || '';
    const ok = res.status === 302 &&
      /^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?tag=/.test(loc) &&
      !/bit\.ly|t\.co|tinyurl|ow\.ly|buff\.ly|amzn\.to/i.test(loc);
    if (!ok) events.push({ sku: r.sku, action: 'PULL', reason: 'link_health_fail_' + res.status });
  }
  return events;
}

/** Daily. Rolling 30-day qualifying orders vs 10. */
async function apiAccessHealth(ctx) {
  const orders = ctx.orders30;
  if (orders == null) return [{ action: 'FLAG', reason: 'orders_30_unavailable' }];
  if (orders < 10) return [{ action: 'FULL_PIPELINE_ALERT', reason: `orders_30=${orders}` }];
  if (orders < 14) return [{ action: 'WEEKLY_WARNING', reason: `orders_30=${orders}` }];
  return [];
}

/** Daily. 90% of cap → freeze new ASIN intake. */
async function costBurn(ctx) {
  const { spendUsd, capDailyUsd } = ctx.cost;
  if (capDailyUsd == null) return [];
  const pct = spendUsd / capDailyUsd;
  if (pct >= 0.9) return [{ action: 'FREEZE_INTAKE', reason: `cost_burn_${(pct * 100).toFixed(0)}%` }];
  return [];
}

/** Hourly. PENDING_APPROVAL rows older than 72h → EXPIRED → re-verify loop. */
async function freshnessSla(ctx) {
  const rows = await ctx.listProducts({ status: 'PENDING_APPROVAL' });
  const events = [];
  for (const r of rows) {
    const entered = r.status_entered_at;
    if (!entered) continue;
    const ageH = (Date.now() - new Date(entered).getTime()) / 3600000;
    if (ageH > 72) events.push({ sku: r.sku, action: 'EXPIRE', reason: `age_${ageH.toFixed(1)}h` });
  }
  return events;
}

/** Weekly. Every PUBLISHED page: exact phrase, price timestamp, link. */
async function complianceCrawl(ctx) {
  const rows = await ctx.listProducts({ status: 'PUBLISHED' });
  const events = [];
  const DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.';
  for (const r of rows) {
    const html = await ctx.fetchHtml(r.pageUrl);
    const issues = [];
    if (!html.includes(DISCLOSURE))               issues.push('missing_disclosure');
    if (!/price-widget|data-asin=/.test(html))    issues.push('missing_price_widget');
    if (!/\/go\/[A-Z0-9]{10}/.test(html))         issues.push('missing_go_link');
    if (issues.length) events.push({ sku: r.sku, action: 'PULL', reason: 'crawl_' + issues.join('+') });
  }
  return events;
}

/** Daily. Reconcile sheet vs Associates CSV vs /go/ click log within 5%. */
async function metricsRecon(ctx) {
  const sheet = await ctx.sheetClicks24h();
  const csv   = await ctx.csvClicks24h();
  const go    = await ctx.goClicks24h();
  if ([sheet, csv, go].some(v => v == null)) return [{ action: 'FLAG', reason: 'recon_source_unavailable' }];
  const max = Math.max(sheet, csv, go);
  const min = Math.min(sheet, csv, go);
  const skew = max === 0 ? 0 : (max - min) / max;
  if (skew > 0.05) return [{ action: 'FLAG', reason: `recon_skew_${(skew * 100).toFixed(1)}%` }];
  return [];
}
