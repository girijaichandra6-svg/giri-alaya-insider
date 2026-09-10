/** Weekly review (Module 13). Populates the reject-pattern model and proposes agent countermeasures. */
export function buildWeeklyReview(week, ctx) {
  const verdicts  = ctx.verdicts || [];
  const decisions = ctx.decisions || [];

  const byCode = {};
  decisions.filter(d => d.decision === 'REJECT').forEach(d => {
    byCode[d.reason_code] = (byCode[d.reason_code] || 0) + 1;
  });
  const topRejects = Object.entries(byCode)
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([code, count]) => ({ code, count, note: REJECT_NOTES[code] || '' }));

  const rejectRate = decisions.length ? (decisions.filter(d => d.decision === 'REJECT').length / decisions.length) : 0;

  return {
    week,
    published: ctx.publishedCount,
    killed: verdicts.filter(v => v === 'KILLED').length,
    scaled: verdicts.filter(v => v === 'SCALE').length,
    flat:   verdicts.filter(v => v === 'FLAT').length,
    topRejects,
    rejectRate,
    pausePipeline: rejectRate > 0.6,
    categoryWeightRecommendation: ctx.categoryWeightRecommendation || null,
    deepDive: ctx.deepDive || null,
    bfcmReadiness: ctx.bfcmReadiness || null,
    primeReadiness: ctx.primeReadiness || null
  };
}

const REJECT_NOTES = {
  C1: 'angle → tighten hook_thesis check in Selection',
  C2: 'price → increase deal-state weight or wait for window',
  C3: 'hook → Creative Intelligence: mine further refs',
  C4: 'voice → Brand Kit re-read for Asset Producer',
  C5: 'compliance → Compliance Agent: strengthen checklist item',
  C6: 'fit → Selection: tighten category capacity',
  C7: 'visual → Asset Producer: template library audit',
  C8: 'timing → Calendar: adjust deal cadence',
  C9: 'dup → Discovery: dedupe against last 30 days',
  C10: 'brand risk → Selection: tighten brand-tier test',
  C11: 'claims → Claims Auditor: tighten',
  C12: 'disclosure → Compliance: hard fail',
  C13: 'volume → CEO: reduce default asset mix',
  C14: 'audience → Research: sharpen best_for',
  C15: 'timing → keep on HOLD for window'
};
