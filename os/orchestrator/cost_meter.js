/** Per-ASIN + monthly cost meter. Blocks spend at 100% of caps (Module 14). */
const STEP_ESTIMATES = {
  selection: 0.02, data_fill: 0.05, research: 0.60, refs: 0.40,
  render: 1.20, ceo: 0.15
};

export class CostMeter {
  constructor(cfg, sheet) { this.cfg = cfg; this.sheet = sheet; this.spend = { month: 0, byAsin: {} }; }

  add(sku, usd, note) {
    if (!sku || !usd) return;
    this.spend.byAsin[sku] = (this.spend.byAsin[sku] || 0) + usd;
    this.spend.month += usd;
    this.sheet.addCost(sku, usd, note).catch(() => {});
  }
  canSpend(sku, usd) {
    return (this.spend.byAsin[sku] || 0) + usd <= this.cfg.cost.perAsinCapUsd
        && this.spend.month + usd         <= this.cfg.cost.monthlyCapUsd;
  }
  stepCost(kind) { return STEP_ESTIMATES[kind] || 0; }
  intakeFrozen() { return this.spend.month >= 0.9 * this.cfg.cost.monthlyCapUsd; }
}
