/**
 * setup-check.js — pre-deployment sanity check for the ALAYA OS repo.
 * Run: node setup-check.js
 * Verifies module integrity and wiring before the first cron fires.
 */

import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const importLocal = (p) => import(pathToFileURL(join(root, p)).href);

const root = dirname(fileURLToPath(import.meta.url));
const checks = [];
const ok = (name, pass, note = '') => checks.push({ name, pass, note });

// 1. Core files present
const requiredFiles = [
  'orchestrator/dispatch.js',
  'orchestrator/run_one_row.js',
  'orchestrator/sheet_client.js',
  'orchestrator/state_guard.js',
  'orchestrator/cost_meter.js',
  'orchestrator/intake.js',
  'orchestrator/monitors_cron.js',
  'agents/selection.js',
  'agents/data_fill.js',
  'agents/claims_validator.js',
  'agents/creative.js',
  'agents/social.js',
  'agents/compliance.js',
  'agents/ceo_digest.js',
  'agents/analytics.js',
  'agents/weekly_review.js',
  'agents/escalation.js',
  'monitors/index.js',
  'templates/asset_templates.yaml',
  'operators/manual_capture/consume.js',
  'apps-script/Schema.gs',
  'apps-script/Guards.gs',
  '.github/workflows/orchestrator.yaml'
];
requiredFiles.forEach(f => ok('file:' + f, existsSync(join(root, f))));

// 2. Workflow imports resolve
try {
  await importLocal('agents/selection.js');
  ok('import:agents/selection.js', true);
} catch (e) { ok('import:agents/selection.js', false, String(e.message || e)); }
try {
  await importLocal('agents/claims_validator.js');
  ok('import:agents/claims_validator.js', true);
} catch (e) { ok('import:agents/claims_validator.js', false, String(e.message || e)); }
try {
  await importLocal('orchestrator/state_guard.js');
  ok('import:orchestrator/state_guard.js', true);
} catch (e) { ok('import:orchestrator/state_guard.js', false, String(e.message || e)); }

// 3. Guard invariant: no PIPELINE/CEO path into APPROVED
try {
  const { assertAdvanceable } = await importLocal('orchestrator/state_guard.js');
  try { assertAdvanceable('PENDING_APPROVAL', 'APPROVED', 'PIPELINE'); ok('guard:owner-only-approve', false, 'pipeline could approve!'); }
  catch (_) { ok('guard:owner-only-approve', true); }
  try { assertAdvanceable('PENDING_APPROVAL', 'APPROVED', 'CEO'); ok('guard:ceo-cannot-approve', false, 'ceo could approve!'); }
  catch (_) { ok('guard:ceo-cannot-approve', true); }
  try { assertAdvanceable('DISCOVERED', 'SCORED', 'PIPELINE'); ok('guard:legal-transition-ok', true); }
  catch (e) { ok('guard:legal-transition-ok', false, String(e.message || e)); }
} catch (_) { /* already reported above */ }

// 4. Selection engine sanity: a clearly bad candidate must be rejected
try {
  const { scoreCandidate } = await importLocal('agents/selection.js');
  const bad = scoreCandidate({
    amazonCategory: 'Grocery', aov: 10, sellerType: 'FBM', inStock: false,
    rating: 3.0, reviewCount: 10, reviewVelocity30d: 0, safetyCluster: 'x',
    recallOrLawsuitHit: true, primeEligible: false, recentMerge: true,
    apiVerifyable: false, category: 'Lifestyle', demoScore: 1, hookThesis: '',
    objections: [], viralRefs: 0, requiresHealthClaim: true
  });
  ok('selection:rejects-bad-candidate', bad.verdict === 'REJECTED', 'verdict=' + bad.verdict);

  const good = scoreCandidate({
    amazonCategory: 'Kitchen', aov: 700, brandTier: true, sellerType: 'Amazon',
    inStock: true, stockStability30d: 0.98, rating: 4.8, reviewCount: 12400,
    reviewVelocity30d: 45, primeEligible: true, recentMerge: false, apiVerifyable: true,
    category: 'Home', demandEvidence: true, seasonality: 'non-seasonal',
    giftability: true, demoScore: 5, hookThesis: 'The details that make it a keeper',
    objections: ['price'], viralRefs: 6, requiresHealthClaim: false,
    premiumEvergreen: true
  });
  ok('selection:accepts-strong-candidate', good.verdict === 'SCORED', 'verdict=' + good.verdict + ' score=' + good.score);
} catch (e) { ok('selection:engine', false, String(e.message || e)); }

// 5. Claims validator sanity
try {
  const { validateClaimSet } = await importLocal('agents/claims_validator.js');
  const r = validateClaimSet([
    { text: 'We tested this unit for 30 days.' },
    { text: 'Cast iron, 5.5 qt, 7.7 lbs.', claim_type: 'spec', source_url: 'https://example.com/spec' }
  ]);
  ok('claims:rejects-banned-experience', !r.pass, JSON.stringify(r.results[0].issues || []));
} catch (e) { ok('claims:validator', false, String(e.message || e)); }

const failed = checks.filter(c => !c.pass);
console.log('─'.repeat(60));
checks.forEach(c => console.log((c.pass ? '  ✅ ' : '  ❌ ') + c.name + (c.note ? '  — ' + c.note : '')));
console.log('─'.repeat(60));
console.log(failed.length === 0
  ? 'ALL CHECKS PASSED — repo is ready to push.'
  : failed.length + ' CHECK(S) FAILED — fix above before pushing.');
process.exit(failed.length === 0 ? 0 : 1);
