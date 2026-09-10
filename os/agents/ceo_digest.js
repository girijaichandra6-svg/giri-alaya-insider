/**
 * CEO Digest generator (Module 10). Never estimates — missing metrics are
 * surfaced as UNVERIFIED, never guessed. If a data source is down, the digest says so.
 */
export function buildDigest(day, sources) {
  const g = (v) => (v == null || v === '' ? 'UNVERIFIED' : v);
  const pending = (sources.pendingApproval || [])
    .sort((a, b) => (b.predictedEpk || 0) - (a.predictedEpk || 0))
    .slice(0, 10)
    .map(r => `${r.sku} · ${r.name} · EPC~${r.predictedEpk != null ? r.predictedEpk.toFixed(2) : '?'} · ${r.pitch15s || ''}`)
    .join('\n');

  const riskFlags = (sources.risks || []).join(' | ') || 'none';
  const recs = (sources.recommendations || []).slice(0, 3);

  const orders30 = sources.apiHealthOrders30;
  const probationDaysLeft = sources.probationDaysLeft;
  const probationStatus =
    orders30 == null ? 'UNVERIFIED' :
    orders30 >= 3 ? `satisfied (${orders30})` :
    `probation — ${orders30}/3, ${probationDaysLeft != null ? probationDaysLeft + 'd left' : 'timer UNVERIFIED'}`;

  const costBurn = sources.costBurnUsd != null && sources.costCapUsd != null
    ? `${sources.costBurnUsd.toFixed(2)}/${sources.costCapUsd.toFixed(2)}`
    : 'UNVERIFIED';

  return [
    day,
    g(sources.scoredToday),
    g(sources.passedGates),
    pending || '—',
    g(sources.publishedYesterday),
    g(sources.clicks24h),
    g(sources.revenue24h),
    g(sources.epk7d),
    orders30 == null ? 'UNVERIFIED' : orders30,
    costBurn,
    riskFlags,
    recs.join(' • ') || '—',
    probationStatus
  ];
}

export function digestAsMemo(digest) {
  const COLS = ['date','scored_today','passed_gates','pending_approval_top10','published_yesterday',
    'clicks_24h','revenue_24h','epk_7d','api_health_orders_30d','cost_burn_vs_cap',
    'risk_flags','recommendations_3','probation_status'];
  const lines = COLS.map((c, i) => `- **${c}:** ${digest[i]}`);
  return lines.join('\n');
}
