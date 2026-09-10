/**
 * Validates a manual capture before Data Fill consumes it (Module 15). Fail-closed:
 * any missing or stale field → the fetch throws, and Data Fill writes UNVERIFIED.
 * Never a partial pass.
 */
export function validateManualCapture(cap, maxAgeMs = 3600000) {
  const errs = [];
  const req = ['asin', 'captured_at', 'captured_by', 'page_hash', 'screenshot_path', 'fields'];
  req.forEach(k => { if (!cap || cap[k] == null) errs.push('missing:' + k); });
  if (errs.length) return { ok: false, errs };

  if (!/^[A-Z0-9]{10}$/.test(cap.asin))             errs.push('asin_format');
  if (!/^sha256:[0-9a-f]{64}$/.test(cap.page_hash)) errs.push('page_hash_format');
  if (!/^[^@\s]+@[^@\s]+$/.test(cap.captured_by))   errs.push('captured_by_not_email');

  const ageMs = Date.now() - new Date(cap.captured_at).getTime();
  if (!isFinite(ageMs) || ageMs < 0) errs.push('captured_at_invalid');
  else if (ageMs > maxAgeMs)         errs.push(`captured_at_stale:${Math.round(ageMs / 60000)}min`);

  const f = cap.fields || {};
  ['title', 'brand', 'price', 'rating', 'review_count'].forEach(k => {
    if (f[k] == null || f[k] === '') errs.push('field_missing:' + k);
  });
  if (f.price        != null && !(Number(f.price) > 0))                           errs.push('price_not_positive');
  if (f.rating       != null && !(Number(f.rating) >= 0 && Number(f.rating) <= 5)) errs.push('rating_range');
  if (f.review_count != null && !(Number.isInteger(Number(f.review_count)) && Number(f.review_count) >= 0))
    errs.push('review_count_not_integer');

  return { ok: errs.length === 0, errs };
}
