/** Claims validator (Module 6). Rejects any claim that fails the auditor's checklist before it lands. */
const BANNED_EXPERIENCE = [
  /\bwe\s+(tested|tried|used|own|reviewed\s+in[\s-]?person)\b/i,
  /\bhands[\s-]?on\b/i,
  /\bin[\s-]?house\s+(test|user)\b/i,
  /\bour\s+unit\b/i
];
const BANNED_HYPE = [
  /\b(shocking|insane|must[\s-]?have|stop\s+scrolling|you\s+won['’]?t\s+believe)\b/i,
  /!!+/,
  /\b(deal\s+of\s+the\s+(century|year)|once[\s-]?in[\s-]?a[\s-]?lifetime)\b/i
];
const HEALTH_CLAIM = /\b(cures?|treats?|heals?|improves?\s+(your\s+)?(health|immunity|sleep\s+quality)|clinically\s+proven)\b/i;

export function validateClaim(claim, opts = {}) {
  const c = String(claim.text || '');
  const issues = [];

  if (!c.trim()) issues.push({ code: 'EMPTY', note: 'empty claim' });
  if (BANNED_EXPERIENCE.some(re => re.test(c)))
    issues.push({ code: 'BANNED_EXPERIENCE', note: '"we tested/tried/used/own" or "hands-on"' });
  if (BANNED_HYPE.some(re => re.test(c)))
    issues.push({ code: 'BANNED_HYPE', note: 'hype lexicon' });
  if (HEALTH_CLAIM.test(c) && !opts.allowHealthClaim)
    issues.push({ code: 'HEALTH_CLAIM', note: 'health/medical efficacy claim' });

  const types = new Set(Array.isArray(claim.claim_type) ? claim.claim_type : [claim.claim_type].filter(Boolean));
  const objective = ['spec', 'comparison', 'price-history'].some(t => types.has(t));
  if (objective && !claim.source_url) issues.push({ code: 'SOURCE_MISSING', note: 'objective claim without source_url' });
  if (types.has('review-quote') && !claim.source_url)
    issues.push({ code: 'QUOTE_NO_SOURCE', note: 'review quote without URL' });
  if (types.has('review-quote') && !/\bbuyers?\s+say\b|\breviewers?\s+(say|note|mention|report)\b/i.test(c))
    issues.push({ code: 'QUOTE_UNATTRIBUTED', note: 'review quote must attribute ("buyers say…")' });

  if (issues.length) return { verdict: 'REJECT', issues };
  return { verdict: 'PASS', issues: [] };
}

export function validateClaimSet(claims) {
  const results = claims.map(c => ({ ...c, ...validateClaim(c) }));
  return {
    pass: results.every(r => r.verdict === 'PASS'),
    results
  };
}
