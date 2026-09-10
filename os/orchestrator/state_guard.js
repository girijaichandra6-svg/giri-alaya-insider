/** Client-side mirror of the sheet transition matrix. Defense in depth (Module 14). */
const MATRIX = {
  DISCOVERED:       { SCORED:            ['PIPELINE'] },
  SCORED:           { VERIFIED:          ['PIPELINE'] },
  VERIFIED:         { RESEARCHED:        ['PIPELINE'] },
  RESEARCHED:       { CREATIVES_READY:   ['PIPELINE'] },
  CREATIVES_READY:  { RENDERED:          ['PIPELINE'] },
  RENDERED:         { COMPLIANCE_PASS:   ['PIPELINE'] },
  COMPLIANCE_PASS:  { PENDING_APPROVAL:  ['CEO']      },
  // PENDING_APPROVAL → APPROVED absent by design. Only the Owner dropdown.
  APPROVED:         { PUBLISHED:         ['PIPELINE'] },
  PUBLISHED:        { MONITORING:        ['PIPELINE'] },
  MONITORING:       { VERDICTED:         ['PIPELINE'] }
};

export function assertAdvanceable(from, to, actor) {
  const allowed = MATRIX[from] && MATRIX[from][to];
  if (!allowed || !allowed.includes(actor))
    throw new Error(`state_guard: ${actor} cannot advance ${from} → ${to}`);
  return true;
}
