import { MONITORS } from '../monitors/index.js';

const BATCHES = {
  hourly: ['price_drift', 'stock', 'link_health', 'freshness_sla'],
  daily:  ['asin_health', 'rating_drift', 'api_access_health', 'cost_burn', 'metrics_recon'],
  weekly: ['compliance_crawl']
};

/** Runs the batch for the given cadence. Never throws — reports per-monitor (Module 14). */
export async function runMonitorBatch(cadence, ctx) {
  const names = BATCHES[cadence] || [];
  const out = [];
  for (const name of names) {
    const fn = MONITORS[name];
    if (!fn) { out.push({ monitor: name, error: 'not_implemented' }); continue; }
    try {
      const events = await fn(ctx);
      out.push({ monitor: name, events });
    } catch (e) {
      out.push({ monitor: name, error: String(e && e.message || e) });
    }
  }
  return out;
}
