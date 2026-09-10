/**
 * Asset Producer (Module 7). Emits the five Package objects the Render Agent consumes.
 * Does NOT render. Creative QA checks these before the render queue.
 * Default is NO synthetic people; any synthetic person forces the AI label flag.
 */
export function buildAssetPackages(product, research, refs, opts = {}) {
  const sku  = product.sku || '';
  const asin = sku.replace(/^AL-/, '');
  const utmBase = `utm_source={platform}&utm_medium={type}&utm_campaign=${asin}_{hookno}`;

  const S1 = pkg({
    id: sku + '-S1', type: 'S1',
    platform: ['tiktok', 'instagram', 'youtube'],
    hookType: 'detail-reveal',
    hookLine: opts.s1Hook || `The three details that make ${product.name} a keeper.`,
    durationS: 28,
    script: [
      [0,  `VO: The three details that make ${product.name} a keeper.`],
      [3,  `VO: ${trim(research.benefits && research.benefits[0], 80)}`],
      [9,  `VO: ${trim(research.benefits && research.benefits[1], 80)}`],
      [15, `VO: One honest trade-off — ${trim(research.cons && research.cons[0], 70)}`],
      [22, `VO: Link in bio, and full notes on the site.`]
    ],
    onScreen: ['3 details', '1 honest trade-off', 'Specs on the site'],
    audio: 'calm instrumental, low-mid, no vocals',
    captionFirstLine: '#ad ' + (product.name || 'Our pick'),
    hashtags: nicheHashtags(product),
    disclosureBlock: 'tiktok+reels+shorts',
    priceFreshness: 'n/a',
    utm: utmBase.replace('{hookno}', 'h1'),
    aiContentFlags: { set: true, synthetic_person: false, synthetic_voice: false, synthetic_broll: true }
  });

  const S2 = pkg({
    id: sku + '-S2', type: 'S2',
    platform: ['tiktok', 'instagram', 'youtube'],
    hookType: 'question',
    hookLine: opts.s2Hook || `Why do people who already own one buy another?`,
    durationS: 26,
    script: [
      [0,  `VO: ${product.name}. Why do owners buy a second?`],
      [4,  `VO: ${trim(research.why_we_recommend, 150)}`],
      [14, `VO: The honest catch — ${trim((research.cons && research.cons[1]) || (research.cons && research.cons[0]), 70)}`],
      [22, `VO: Full breakdown on the site. Link in bio.`]
    ],
    onScreen: ['Who buys two', 'The real reason'],
    audio: 'soft piano over ambient texture',
    captionFirstLine: '#ad ' + product.name,
    hashtags: nicheHashtags(product),
    disclosureBlock: 'tiktok+reels+shorts',
    priceFreshness: 'n/a',
    utm: utmBase.replace('{hookno}', 'h2'),
    aiContentFlags: { set: true, synthetic_person: false, synthetic_voice: false, synthetic_broll: true }
  });

  const H1 = pkg({
    id: sku + '-H1', type: 'H1',
    platform: ['tiktok', 'instagram', 'youtube', 'pinterest'],
    hookType: 'cinematic',
    hookLine: `${product.name} — the visual case.`,
    durationS: 75,
    script: [
      [0,  'Music-only open, hero product frames from A+ / brand media kit'],
      [15, 'VO enters: What this is, who makes it, why it holds up.'],
      [40, 'Spec walkthrough — sourced, one comparison line.'],
      [60, 'Honest trade-off, then the site.']
    ],
    onScreen: ['Spec-led', 'No hype', 'Notes on site'],
    audio: 'music-led, VO sparse',
    captionFirstLine: '#ad ' + (product.brand || '') + ' ' + product.name,
    hashtags: nicheHashtags(product),
    disclosureBlock: 'all',
    priceFreshness: 'n/a',
    utm: utmBase.replace('{hookno}', 'h1'),
    aiContentFlags: { set: true, synthetic_person: false, synthetic_voice: false, synthetic_broll: true }
  });

  const L1 = pkg({
    id: sku + '-L1', type: 'L1',
    platform: ['youtube'],
    hookType: 'long-form-review',
    hookLine: `${product.name} Review (2026) — who it's for, who should skip.`,
    durationS: 420,
    script: [
      [0,   'Cold open — the one-sentence verdict.'],
      [30,  'Verbal disclosure.'],
      [60,  'Spec table (sourced).'],
      [150, 'Pros and cons mining from review clusters (attributed).'],
      [270, 'Price-history section.'],
      [350, 'Buying advice — sizing/spec choice, who should skip.'],
      [400, 'CTA to site + Good Finds list.']
    ],
    onScreen: ['Spec table', 'Pros/Cons', 'Price history'],
    audio: 'VO-led, light bed',
    captionFirstLine: '#ad ' + product.name + ' — full review.',
    hashtags: [],
    disclosureBlock: 'youtube',
    priceFreshness: 'requires ≤1h verify at publish',
    utm: utmBase.replace('{hookno}', 'l1'),
    aiContentFlags: { set: true, synthetic_person: false, synthetic_voice: false, synthetic_broll: true }
  });

  const D1 = pkg({
    id: sku + '-D1', type: 'D1',
    platform: ['instagram', 'pinterest'],
    hookType: 'deal-carousel',
    hookLine: `${product.name} — the current state of the price, in 4 slides.`,
    durationS: null,
    slides: [
      'Hook: ' + trim(research.why_we_recommend, 60),
      'Proof: ' + trim((research.benefits || []).join(' · '), 120),
      'Specs: ' + trim((research.pros || []).join(' · '), 120),
      'Price vs 12-mo history, then CTA.'
    ],
    audio: 'n/a',
    captionFirstLine: '#ad ' + product.name + ' — deal state.',
    hashtags: nicheHashtags(product),
    disclosureBlock: 'instagram+pinterest',
    priceFreshness: 'STRICT ≤1h at publish — render blocks if stale',
    utm: utmBase.replace('{hookno}', 'd1'),
    aiContentFlags: { set: true, synthetic_person: false, synthetic_voice: false, synthetic_broll: false }
  });

  return [S1, S2, H1, L1, D1];
}

function pkg(o) { return Object.freeze(o); }
function trim(s, n) { s = String(s || ''); return s.length <= n ? s : s.slice(0, n - 1) + '…'; }
function nicheHashtags(p) {
  const cats = ({ Home: ['#kitchen', '#home'], Beauty: ['#skincare'], Electronics: ['#tech'],
    Travel: ['#travelgear'], Fashion: ['#wardrobe'], Lifestyle: ['#everyday'] })[p.category] || [];
  return cats.slice(0, 4);
}
export const __test__ = { trim, nicheHashtags };
