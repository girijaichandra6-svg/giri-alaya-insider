/** Analytics snapshots + verdict engine (Module 12). Never loosens a rule to "save" an asset. */
export async function snapshotCycle(ctx, whenHours) {
  const assets = await ctx.listAssets({ published: true, notVerdicted: true });
  const snapshots = [];
  for (const a of assets) {
    const publishedAt = new Date(a.published_at).getTime();
    const ageH = (Date.now() - publishedAt) / 3600000;
    if (ageH < whenHours) continue;
    const m = await ctx.pullMetrics(a.asset_id);
    const snap = { asset_id: a.asset_id, hour: whenHours, ...m };
    snapshots.push(snap);
    await ctx.writeMetrics(snap);
  }
  return snapshots;
}

export function verdict(a, categoryMedianViews) {
  // 48h rules — both must pass to survive.
  if (a.hold3_pct != null && a.hold3_pct < 0.25) return 'KILLED';
  if (a.ctr != null && a.ctr < 0.003) return 'KILLED';
  if (a.views_72h != null && categoryMedianViews && a.views_72h >= 3 * categoryMedianViews)
    return 'SCALE';
  return 'FLAT';
}

export function scaleEligibility(a, breakEvenCac) {
  const roi = a.spend > 0 ? (a.revenue - a.spend) / a.spend : null;
  const cac = a.orders > 0 ? a.spend / a.orders : Infinity;
  return {
    roi,
    cac,
    breakEvenCac,
    allowed: roi != null && roi >= 0 && cac <= breakEvenCac
  };
}
