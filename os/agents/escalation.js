/**
 * Escalation engine (Module 17). Produces the standard escalation message so no
 * agent can quietly omit a section. The 2-Options section is required; passthrough
 * is not allowed. CEO is the only actor who signs escalations to Owner.
 */
export function escalate({ what, whatINeed, options, recommendation, severity, blocking, evidence }) {
  const errs = [];
  if (!what || String(what).trim().length < 20)                errs.push('what_too_short');
  if (!whatINeed || String(whatINeed).trim().length < 10)      errs.push('what_i_need_missing');
  if (!Array.isArray(options) || options.length !== 2)         errs.push('must_be_exactly_2_options');
  if (options && options.length === 2) {
    options.forEach((o, i) => {
      if (!o || !o.label || !o.body) errs.push(`option_${i + 1}_incomplete`);
    });
  }
  if (!recommendation || !/option\s*[12ab]/i.test(String(recommendation)))
    errs.push('recommendation_must_name_an_option');
  if (errs.length) throw new Error('ESCALATION_MALFORMED: ' + errs.join(','));

  return Object.freeze({
    severity: severity || 'MEDIUM',
    blocking: !!blocking,
    header: 'ESCALATION',
    what: String(what).trim(),
    whatINeed: String(whatINeed).trim(),
    options: options.map((o, i) => ({
      n: i + 1, label: o.label, body: o.body,
      cost: o.cost || null, risk: o.risk || null, reversible: !!o.reversible
    })),
    recommendation: String(recommendation).trim(),
    evidence: (evidence || []).slice(0, 20),
    ts: new Date().toISOString()
  });
}

export function renderEscalation(esc) {
  const lines = [];
  lines.push('**WHAT**');
  lines.push(esc.what);
  lines.push('');
  lines.push('**WHAT I NEED**');
  lines.push(esc.whatINeed);
  lines.push('');
  lines.push('**2 OPTIONS + RECOMMENDATION**');
  esc.options.forEach(o => {
    lines.push(`**Option ${o.n} — ${o.label}.** ${o.body}` +
      (o.cost ? ` Cost: ${o.cost}.` : '') +
      (o.risk ? ` Risk: ${o.risk}.` : '') +
      (o.reversible ? ' Reversible.' : ''));
  });
  lines.push('');
  lines.push('**Recommendation:** ' + esc.recommendation);
  if (esc.evidence.length) {
    lines.push('');
    lines.push('**Evidence**');
    esc.evidence.forEach(e => lines.push('- ' + e));
  }
  lines.push('');
  lines.push(`Severity: ${esc.severity} · Blocking: ${esc.blocking ? 'yes' : 'no'} · ${esc.ts}`);
  return lines.join('\n');
}
