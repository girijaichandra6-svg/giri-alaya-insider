import { scoreCandidate } from '../agents/selection.js';

/** Promote Pipeline candidates → Products. Never duplicates. Enforces cap freeze (Module 14). */
export async function runIntake(sheet, candidates, meter) {
  if (meter.intakeFrozen()) return { skipped: 'cost_freeze' };
  const promoted = [];
  for (const c of candidates) {
    if (meter.intakeFrozen()) break;
    const score = scoreCandidate(c);
    if (score.verdict !== 'SCORED') {
      await sheet.writeDecision({ sku: c.sku, actor: 'PIPELINE',
        decision: score.verdict === 'REJECTED' ? 'REJECT' : 'HOLD',
        reason_code: 'SELECTION_' + score.verdict,
        note: JSON.stringify(score.hard_gate_fails).slice(0, 400) });
      continue;
    }
    const existing = await sheet.listRows({ asin: c.asin });
    if (existing && existing.length) continue;
    await sheet.transition({ sku: c.sku, from: 'DISCOVERED', to: 'SCORED',
      actor: 'pipeline@alayainsider.com', note: 'intake_score=' + score.score });
    promoted.push(c);
  }
  return { promoted };
}
