/**
 * Selection Agent scoring engine (Module 5). Pure function — no side effects, no writes.
 * Caller decides flow: verdict SCORED → advance; HOLD (55–69) → hold list; REJECTED → never promote.
 *
 * CALIBRATION RULING (owner-approved, PROVISIONAL):
 *   EPC_COLD_FLOOR 0.10 → 0.03 and EPC_DEAL_FLOOR 0.30 → 0.09.
 *   Review at >=100 real clicks per category or 30 days, whichever first.
 *   Every SCORED verdict carries _calibration so downstream agents see it.
 */

export const CATEGORY_WEIGHTS = { Travel: 25, Electronics: 20, Home: 20, Fashion: 15, Beauty: 12, Lifestyle: 8 };

export const RATE_TABLE = {
  'Luxury Beauty': 10, 'Books': 4.5, 'Kitchen': 4.5, 'Automotive': 4.5,
  'Amazon Devices': 4, 'Apparel': 4, 'Shoes': 4, 'Jewelry': 4, 'Luggage': 4,
  'Handbags': 4, 'All Other': 4, 'Toys': 3, 'Furniture': 3, 'Home': 3,
  'Headphones': 3, 'Beauty': 3, 'Sports': 3, 'Outdoors': 3, 'Tools': 3,
  'PC': 2.5, 'TV': 2, 'Digital Games': 2, 'Grocery': 1, 'Health': 1
};

export const HARD_GATE_CATEGORIES = new Set(['Grocery', 'Health', 'Amazon Fresh', 'TV', 'Digital Games', 'Gift Cards']);

const EPC_COLD_FLOOR    = 0.03;  // PROVISIONAL — was 0.10. Owner-approved dry-run finding 1.
const EPC_DEAL_FLOOR    = 0.09;  // PROVISIONAL — was 0.30.
const CALIBRATION_REVIEW_AT_CLICKS = 100;

export function scoreCandidate(input) {
  const fails = [];
  const addFail = (code, note) => fails.push({ code, note });

  const result = { score: 0, breakdown: {}, hard_gate_fails: [], hook_thesis_ok: false };

  // ── A. ECONOMICS (30) ────────────────────────────────────────────────────
  if (HARD_GATE_CATEGORIES.has(input.amazonCategory)) addFail('GATE_0PCT_CATEGORY', input.amazonCategory);
  const rate = RATE_TABLE[input.amazonCategory];
  if (rate == null) addFail('GATE_RATE_UNKNOWN', input.amazonCategory);

  const aov = Number(input.aov);
  if (!(aov >= 40 && aov <= 2000)) addFail('GATE_AOV_LANE', 'aov=' + aov);
  if (aov > 500 && !input.brandTier) addFail('GATE_BRAND_TIER', 'aov>500, no tier');

  const comm = rate != null && isFinite(aov) ? aov * rate / 100 : NaN;
  const commFloor = aov >= 300 ? 10 : 2.5;
  if (isFinite(comm) && comm < commFloor) addFail('GATE_COMMISSION_FLOOR', 'comm=' + comm.toFixed(2));

  const epc_est  = isFinite(comm) ? comm * 0.02 * 0.06 : 0;
  const epc_deal = isFinite(comm) ? comm * 0.02 * 0.10 : 0;
  if (epc_est < EPC_COLD_FLOOR) addFail('GATE_EPC_COLD', 'epc=' + epc_est.toFixed(3));

  const dealNow = Number(input.discountPct || 0) >= 20 || !!input.coupon || Number(input.pricePctile12) <= 30;
  if (!dealNow && !input.premiumEvergreen) addFail('GATE_DEAL_STATE', 'impulse lane requires deal');
  if (dealNow && isFinite(comm) && epc_deal < EPC_DEAL_FLOOR) addFail('GATE_EPC_DEAL', 'deal_epc=' + epc_deal.toFixed(3));

  const econPts =
    (rate != null && !HARD_GATE_CATEGORIES.has(input.amazonCategory) ? 6 : 0) +
    (aov >= 40 && aov <= 2000 ? 6 : 0) +
    (isFinite(comm) && comm >= commFloor ? 8 : 0) +
    (epc_est >= EPC_COLD_FLOOR ? 6 : 0) +
    (dealNow || input.premiumEvergreen ? 4 : 0);
  result.breakdown.Economics = Math.min(30, econPts);

  // ── B. AMAZON-SIDE HEALTH (25) ───────────────────────────────────────────
  if (input.sellerType !== 'Amazon' && input.sellerType !== 'FBA') addFail('GATE_SELLER_TYPE', input.sellerType);
  if (!input.inStock) addFail('GATE_OOS', 'out_of_stock');
  if (Number(input.stockStability30d || 0) < 0.95) addFail('GATE_STOCK_STABILITY', input.stockStability30d);
  const minReviews = aov >= 500 ? 100 : 300;
  if (Number(input.rating || 0) < 4.2) addFail('GATE_RATING', input.rating);
  if (Number(input.reviewCount || 0) < minReviews) addFail('GATE_REVIEW_COUNT', input.reviewCount + '<' + minReviews);
  if (Number(input.reviewVelocity30d || 0) < 10) addFail('GATE_REVIEW_VELOCITY', input.reviewVelocity30d);
  if (input.safetyCluster) addFail('GATE_SAFETY_CLUSTER', input.safetyCluster);
  if (input.recallOrLawsuitHit) addFail('GATE_RECALL_HIT', 'yes');
  if (!input.primeEligible) addFail('GATE_PRIME', 'no');
  if (input.recentMerge) addFail('GATE_ASIN_STABLE', 'recent_merge');
  if (!input.apiVerifyable) addFail('GATE_API_VERIFYABLE', 'no');

  const healthPts =
    ((input.sellerType === 'Amazon' || input.sellerType === 'FBA') ? 5 : 0) +
    (input.inStock && Number(input.stockStability30d || 0) >= 0.95 ? 4 : 0) +
    (Number(input.rating || 0) >= 4.2 ? 3 : 0) +
    (Number(input.reviewCount || 0) >= minReviews ? 3 : 0) +
    (Number(input.reviewVelocity30d || 0) >= 10 ? 2 : 0) +
    (!input.safetyCluster ? 3 : 0) +
    (!input.recallOrLawsuitHit ? 2 : 0) +
    (input.primeEligible ? 2 : 0) +
    (!input.recentMerge ? 1 : 0);
  result.breakdown.AmazonHealth = Math.min(25, healthPts);

  // ── C. DEMAND (15) ───────────────────────────────────────────────────────
  const cap = CATEGORY_WEIGHTS[input.category] || 0;
  const seasonal = input.seasonality || 'non-seasonal';
  const ltv = !!input.giftability || !!input.replacementCycle || !!input.accessoryStory;

  const demandPts =
    (cap > 0 ? 5 : 0) +
    (input.demandEvidence ? 5 : 0) +
    (seasonal ? 2 : 0) +
    (ltv ? 3 : 0);
  result.breakdown.Demand = Math.min(15, demandPts);

  // ── D. CONTENT POTENTIAL (20) ────────────────────────────────────────────
  if (Number(input.demoScore || 0) < 4) addFail('GATE_DEMO_SCORE', input.demoScore);
  const hookOk = typeof input.hookThesis === 'string' && input.hookThesis.trim().length >= 12;
  if (!hookOk) addFail('GATE_HOOK_THESIS', 'missing');
  const objections = (input.objections || []).length;
  if (objections > 3) addFail('GATE_OBJECTIONS', objections);
  if (Number(input.viralRefs || 0) < 5) addFail('GATE_VIRAL_REFS', input.viralRefs);
  if (input.requiresHealthClaim) addFail('GATE_CLAIMS_SAFETY', 'health-claim dependency');

  const contentPts =
    (Number(input.demoScore || 0) >= 4 ? 6 : 0) +
    (hookOk ? 4 : 0) +
    (objections <= 3 ? 3 : 0) +
    (Number(input.viralRefs || 0) >= 5 ? 4 : 0) +
    (!input.requiresHealthClaim ? 3 : 0);
  result.breakdown.Content = Math.min(20, contentPts);

  // ── Totals + verdict ─────────────────────────────────────────────────────
  result.score = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
  result.hard_gate_fails = fails;
  result.hook_thesis_ok = hookOk;
  result.commission_per_order = isFinite(comm) ? comm : null;
  result.epc_est_cold = epc_est;
  result.epc_est_deal = epc_deal;
  result._calibration = {
    epc_cold_floor: EPC_COLD_FLOOR,
    epc_deal_floor: EPC_DEAL_FLOOR,
    provisional: true,
    review_at_clicks: CALIBRATION_REVIEW_AT_CLICKS
  };

  if (fails.length) result.verdict = 'REJECTED';
  else if (result.score >= 70) result.verdict = 'SCORED';
  else if (result.score >= 55) result.verdict = 'HOLD';
  else result.verdict = 'REJECTED';

  return result;
}
