import { assertAdvanceable } from './state_guard.js';
import { scoreCandidate }    from '../agents/selection.js';
import { fillProductRow }    from '../agents/data_fill.js';
import { validateClaimSet }  from '../agents/claims_validator.js';
import { buildAssetPackages } from '../agents/creative.js';
import { preflight }         from '../agents/social.js';
import { runCompliance }     from '../agents/compliance.js';

/**
 * Advance ONE row by ONE step. Idempotent. Never crosses PENDING_APPROVAL (Module 14).
 * Upstream "good enough to advance" judgement comes from the paired verifier deps
 * (facts, research, refs, render, complianceCtx, ceoDigest) wired by the caller.
 */
export async function runOneRow(sheet, row, deps) {
  const state = row.status;

  switch (state) {
    case 'DISCOVERED': {
      const s = scoreCandidate(row._selection_input || {});
      if (s.verdict !== 'SCORED') {
        await sheet.writeDecision({ sku: row.sku, actor: 'PIPELINE',
          decision: s.verdict === 'REJECTED' ? 'REJECT' : 'HOLD',
          reason_code: 'SELECTION_' + s.verdict,
          note: JSON.stringify(s.hard_gate_fails).slice(0, 400) });
        return { advanced: false, reason: 'selection_' + s.verdict };
      }
      assertAdvanceable('DISCOVERED', 'SCORED', 'PIPELINE');
      await sheet.transition({ sku: row.sku, from: 'DISCOVERED', to: 'SCORED',
        actor: deps.actorPipeline, note: `score=${s.score}` });
      deps.meter.add(row.sku, deps.meter.stepCost('selection'), 'selection');
      return { advanced: true, now: 'SCORED' };
    }

    case 'SCORED': {
      const filled = await fillProductRow(
        { asin: row.asin, category: row.category, subcategory: row.subcategory },
        deps.fetchDeps);
      deps.meter.add(row.sku, deps.meter.stepCost('data_fill'), 'data_fill');
      if (filled.status === 'SCORED') {
        await sheet.writeDecision({ sku: row.sku, actor: 'PIPELINE',
          decision: 'HOLD', reason_code: 'DATA_UNVERIFIED',
          note: JSON.stringify(filled._blockers).slice(0, 400) });
        return { advanced: false, reason: 'unverified_fields', blockers: filled._blockers };
      }
      assertAdvanceable('SCORED', 'VERIFIED', 'PIPELINE');
      await sheet.transition({ sku: row.sku, from: 'SCORED', to: 'VERIFIED',
        actor: deps.actorPipeline, note: 'all_factual_fields_sourced' });
      return { advanced: true, now: 'VERIFIED' };
    }

    case 'VERIFIED': {
      const r = await deps.research(row);
      deps.meter.add(row.sku, deps.meter.stepCost('research'), 'research');
      const audit = validateClaimSet(r.claims || []);
      if (!audit.pass) {
        await sheet.writeDecision({ sku: row.sku, actor: 'PIPELINE',
          decision: 'HOLD', reason_code: 'CLAIMS_UNVERIFIED',
          note: JSON.stringify(audit.results.filter(x => x.verdict === 'REJECT')).slice(0, 400) });
        return { advanced: false, reason: 'claims' };
      }
      assertAdvanceable('VERIFIED', 'RESEARCHED', 'PIPELINE');
      await sheet.transition({ sku: row.sku, from: 'VERIFIED', to: 'RESEARCHED',
        actor: deps.actorPipeline, note: 'claims=' + audit.results.length });
      deps.cache[row.sku] = r;
      return { advanced: true, now: 'RESEARCHED' };
    }

    case 'RESEARCHED': {
      const refs = await deps.refs(row);
      deps.meter.add(row.sku, deps.meter.stepCost('refs'), 'refs');
      const pkgs = buildAssetPackages(row, deps.cache[row.sku] || {}, refs || {});
      for (const p of pkgs) for (const plat of p.platform) preflight(p, plat);
      assertAdvanceable('RESEARCHED', 'CREATIVES_READY', 'PIPELINE');
      await sheet.transition({ sku: row.sku, from: 'RESEARCHED', to: 'CREATIVES_READY',
        actor: deps.actorPipeline, note: 'packages=' + pkgs.length });
      return { advanced: true, now: 'CREATIVES_READY' };
    }

    case 'CREATIVES_READY': {
      const files = await deps.render(row);
      deps.meter.add(row.sku, deps.meter.stepCost('render'), 'render');
      assertAdvanceable('CREATIVES_READY', 'RENDERED', 'PIPELINE');
      await sheet.transition({ sku: row.sku, from: 'CREATIVES_READY', to: 'RENDERED',
        actor: deps.actorPipeline, note: 'files=' + ((files && files.length) || 0) });
      return { advanced: true, now: 'RENDERED' };
    }

    case 'RENDERED': {
      const comp = await runCompliance(null, await deps.complianceCtx(row));
      if (!comp.pass) {
        await sheet.writeDecision({ sku: row.sku, actor: 'PIPELINE',
          decision: 'HOLD', reason_code: 'COMPLIANCE_FAIL',
          note: JSON.stringify(comp.failing).slice(0, 400) });
        return { advanced: false, reason: 'compliance', failing: comp.failing };
      }
      assertAdvanceable('RENDERED', 'COMPLIANCE_PASS', 'PIPELINE');
      await sheet.transition({ sku: row.sku, from: 'RENDERED', to: 'COMPLIANCE_PASS',
        actor: deps.actorPipeline, note: 'checklist_10_of_10' });
      return { advanced: true, now: 'COMPLIANCE_PASS' };
    }

    case 'COMPLIANCE_PASS': {
      // CEO-only transition. Signed with the CEO actor identity.
      const digest = await deps.ceoDigest(row);
      deps.meter.add(row.sku, deps.meter.stepCost('ceo'), 'ceo_sign');
      assertAdvanceable('COMPLIANCE_PASS', 'PENDING_APPROVAL', 'CEO');
      await sheet.transition({ sku: row.sku, from: 'COMPLIANCE_PASS', to: 'PENDING_APPROVAL',
        actor: deps.actorCeo, note: 'digest=' + String(digest).slice(0, 60) });
      return { advanced: true, now: 'PENDING_APPROVAL', terminal: true };
    }

    default:
      return { advanced: false, reason: 'not_runner_owned', state };
  }
}
