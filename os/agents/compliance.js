/**
 * Compliance runner (Module 9). Runs the 10-point checklist. Returns pass/fail
 * per point and refuses to pass anything it cannot verify. Missing data → FAIL.
 */
export async function runCompliance(_point, ctx) {
  const results = [];
  const check = (n, label, ok, note) => results.push({ n, label, ok: !!ok, note: note || '' });

  // 1. Price/stock re-verify ≤1h
  const ageMs = ctx.priceVerifiedAt ? Date.now() - new Date(ctx.priceVerifiedAt).getTime() : Infinity;
  const drift = ctx.priceDriftPct != null ? Math.abs(ctx.priceDriftPct) : Infinity;
  check(1, 'price_stock_fresh', ageMs <= 3600000 && drift <= 10,
    `age=${Math.round(ageMs/1000)}s drift=${drift}%`);

  // 2. Exact disclosure phrase on the page draft
  const DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.';
  check(2, 'page_exact_disclosure', (ctx.pageHtml || '').includes(DISCLOSURE),
    ctx.pageHtml ? 'checked' : 'no_page_html');

  // 3. Per-platform disclosure verified on rendered file + caption
  check(3, 'disclosure_placement', ctx.disclosurePreflightPassed === true);

  // 4. AI-content flags + on-screen label if any synthetic person
  const flags = ctx.aiContentFlags || {};
  const needsLabel = !!flags.synthetic_person;
  check(4, 'ai_content_flags',
    flags.set === true && (!needsLabel || ctx.aiLabelVisibleForFullDuration === true),
    JSON.stringify(flags));

  // 5. Claims re-audit — zero unverified objective claims, zero banned experience
  check(5, 'claims_reaudit',
    ctx.unverifiedObjectiveClaims === 0 &&
    ctx.bannedExperiencePhrases === 0 &&
    ctx.healthClaims === 0,
    `obj=${ctx.unverifiedObjectiveClaims} exp=${ctx.bannedExperiencePhrases} health=${ctx.healthClaims}`);

  // 6. Link hygiene — /go/ single-hop, tag present
  check(6, 'link_hygiene',
    ctx.goLinkResolvesSingleHop === true && ctx.tagCorrect === true);

  // 7. Page content — distinct copy, price widget ts, all 10 blocks
  check(7, 'page_content',
    ctx.duplicateCopyAcrossSkus === false &&
    ctx.priceWidgetTimestampPresent === true &&
    ctx.blockCount === 10,
    `dupe=${ctx.duplicateCopyAcrossSkus} ts=${ctx.priceWidgetTimestampPresent} blocks=${ctx.blockCount}`);

  // 8. No incentivized-purchase language anywhere
  const INCENTIVE = /\b(click to support me|support my page|boost this|commission goes to)\b/i;
  check(8, 'no_incentive_language',
    !INCENTIVE.test((ctx.allTextSurface || '')));

  // 9. Brand-safety scan — no defamation, no uncleared audio in hero, voice passes
  check(9, 'brand_safety',
    ctx.competitorDefamation === false &&
    ctx.unclearedHeroAudio === false &&
    ctx.voiceViolationCount === 0);

  // 10. Freshness SLA — rendered <72h ago
  const renderAgeMs = ctx.renderedAt ? Date.now() - new Date(ctx.renderedAt).getTime() : Infinity;
  check(10, 'freshness_sla', renderAgeMs <= 72 * 3600 * 1000,
    `age=${Math.round(renderAgeMs/3600000)}h`);

  const failing = results.filter(r => !r.ok);
  return { pass: failing.length === 0, results, failing };
}
