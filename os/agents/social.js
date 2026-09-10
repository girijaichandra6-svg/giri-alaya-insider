/**
 * Social publisher (Module 8). Enforces per-platform disclosure as a PREFLIGHT.
 * If any disclosure element is missing, the publish call throws and the asset
 * stays in the queue. Never "publishes first, edits caption later."
 */
export const DISCLOSURE_RULES = {
  tiktok:    { toggle: 'disclose_commercial_content', verbalFirst5s: true, onscreenSec: 3,  captionLine1Ad: true },
  instagram: { overlayFirst3s: true, captionLine1Ad: true },
  youtube:   { verbalFirst30s: true, descriptionFirst3Lines: true },
  pinterest: { descriptionDisclosure: true }
};

export function preflight(asset, platform) {
  const rules = DISCLOSURE_RULES[platform];
  if (!rules) throw new Error('UNKNOWN_PLATFORM');
  const problems = [];

  if (rules.captionLine1Ad && !/^#ad\b/i.test(asset.captionFirstLine || ''))
    problems.push('caption_line1_missing_#ad');
  if (rules.verbalFirst5s) {
    const early = (asset.script || []).filter(s => s[0] <= 5).map(s => s[1]).join(' ');
    if (!/affiliate\s+link|commission|#ad/i.test(early)) problems.push('no_verbal_disclosure_first_5s');
  }
  if (rules.onscreenSec != null && !(asset.onScreen || []).some(t => /#ad|affiliate|commission/i.test(t)))
    problems.push('no_onscreen_disclosure');
  if (rules.verbalFirst30s) {
    const early = (asset.script || []).filter(s => s[0] <= 30).map(s => s[1]).join(' ');
    if (!/affiliate\s+link|commission|#ad/i.test(early)) problems.push('no_verbal_disclosure_first_30s');
  }
  if (rules.overlayFirst3s && !asset.reelsOverlayFirst3s)
    problems.push('reels_overlay_missing');
  if (rules.descriptionFirst3Lines && !asset.descriptionDisclosure)
    problems.push('description_disclosure_missing');
  if (rules.descriptionDisclosure && !asset.pinDescriptionDisclosure)
    problems.push('pin_disclosure_missing');

  if (problems.length) throw new Error('DISCLOSURE_PREFLIGHT_FAIL: ' + problems.join(','));
  return true;
}

export async function publishAsset(asset, platform, deps) {
  preflight(asset, platform);
  const poster = deps.posterFor(platform);
  const result = await poster.post(asset);
  return scheduleVerification(result, deps.verifyWithinMinutes || 15);
}

function scheduleVerification(postResult, minutes) {
  return Object.freeze({
    ...postResult,
    verify_by: new Date(Date.now() + minutes * 60000).toISOString(),
    verified: false
  });
}

/** Anti-spam cadence check — run before ANY schedule insert. */
export function cadenceAllows(schedule, platform, candidate) {
  const whenIso = candidate.when;
  const sameDaySamePlatform = schedule.filter(s =>
    s.platform === platform &&
    s.when.slice(0, 10) === whenIso.slice(0, 10));
  if (sameDaySamePlatform.length >= 3) return false; // ≤3 shorts/day/platform

  const when = new Date(whenIso).getTime();
  if (sameDaySamePlatform.some(s => Math.abs(new Date(s.when).getTime() - when) < 30000)) return false;

  // No identical first lines within the same ISO week on the same platform.
  const week = isoWeek(whenIso);
  const dup = schedule.some(s =>
    s.platform === platform && isoWeek(s.when) === week &&
    (s.hook_line || '').trim().toLowerCase() === (candidate.hookLine || '').trim().toLowerCase());
  if (dup) return false;

  return true;
}

function isoWeek(iso) {
  const d = new Date(iso); const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear(); const start = new Date(Date.UTC(y, 0, 1));
  return y + '-W' + Math.ceil((((t - start) / 86400000) + 1) / 7);
}
