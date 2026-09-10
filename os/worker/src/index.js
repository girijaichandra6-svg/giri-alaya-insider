/**
 * Alaya Insider — /go/<ASIN> single-hop redirect (Module 2).
 * Use this Worker ONLY if the Next.js site is not handling /go itself.
 * Contract (Compliance checklist item 6):
 *   1. Exactly one 302 from our domain to a genuine Amazon URL with the correct tag.
 *   2. Location header contains no shortener, no double-encoding, no second redirect.
 *   3. No intermediate HTML, no meta refresh, no JS redirect.
 *   4. Tag is server-side only; never derived from the request.
 */

const ASIN_RE   = /^[A-Z0-9]{10}$/;
const UTM_KEYS  = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const BOT_UA_RE = /(bot|crawler|spider|slurp|preview|facebookexternalhit|slackbot|discordbot|telegrambot|linkedinbot|pinterestbot|whatsapp|bingpreview)/i;

export default {
  async fetch(req, env, ctx) {
    const url  = new URL(req.url);
    const path = url.pathname;

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { 'Allow': 'GET, HEAD' }
      });
    }

    // ---- 1. Validate route -------------------------------------------------
    const m = path.match(/^\/go\/([^\/]+)\/?$/);
    if (!m) return redirectTo(env.FALLBACK_URL, { reason: 'bad_route' });

    const asin = decodeURIComponent(m[1]).toUpperCase();
    if (!ASIN_RE.test(asin)) return redirectTo(env.FALLBACK_URL, { reason: 'bad_asin' });

    // ---- 2. Look up status in KV ------------------------------------------
    // Absence in KV is treated as `active` so a brand-new ASIN is live the
    // moment its Products row is written, before the sync job catches up.
    let rec = null;
    try { rec = await env.ASIN_MAP.get(asin, 'json'); } catch (_) {}
    const status = (rec && rec.status) || 'active';
    const sku    = (rec && rec.sku) || ('AL-' + asin);

    // ---- 3. Capture UTM (for our log only, never forwarded to Amazon) -----
    const utm = {};
    for (const k of UTM_KEYS) {
      const v = url.searchParams.get(k);
      if (v) utm[k] = v.slice(0, 64);
    }

    // ---- 4. Log — never block the redirect on logging ---------------------
    const ua      = (req.headers.get('user-agent') || '').slice(0, 240);
    const referer = (req.headers.get('referer')    || '').slice(0, 320);
    const cf      = req.cf || {};
    const isBot   = BOT_UA_RE.test(ua);

    if (!isBot) {
      const event = {
        ts: new Date().toISOString(),
        asin, sku, status,
        ...utm,
        country:  cf.country  || '',
        colo:     cf.colo     || '',
        referer, ua
      };

      try {
        env.CLICKS.writeDataPoint({
          indexes: [sku],
          blobs:   [asin, status,
                    utm.utm_source   || '', utm.utm_medium || '',
                    utm.utm_campaign || '', utm.utm_content || '',
                    utm.utm_term     || '', referer, countryOf(cf)],
          doubles: [1]
        });
      } catch (_) {}

      if (env.LOG_WEBHOOK_URL) {
        const body = JSON.stringify(event);
        ctx.waitUntil(
          fetch(env.LOG_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-alaya-secret': env.LOG_WEBHOOK_SECRET || ''
            },
            body
          }).catch(() => {})
        );
      }
    }

    // ---- 5. Destination decision ------------------------------------------
    if (status === 'pulled' || status === 'expired') {
      return redirectTo(`${env.FALLBACK_URL}?unavailable=${encodeURIComponent(asin)}`, {
        reason: 'asin_inactive', asin
      });
    }

    if (!env.AMAZON_TAG) {
      // Fail-safe: never send a tag-less link. Attribution without a tag is
      // worse than a detour through our own curation page.
      return redirectTo(env.FALLBACK_URL, { reason: 'tag_unset', asin });
    }

    const host = env.MARKETPLACE_HOST || 'www.amazon.com';
    const dest = `https://${host}/dp/${asin}?tag=${encodeURIComponent(env.AMAZON_TAG)}`;

    return redirectTo(dest, { asin });
  },

  // Hourly cron: probe every ASIN in KV against the four single-hop invariants.
  async scheduled(event, env, ctx) {
    if (!env.LOG_WEBHOOK_URL) return;

    const list = await env.ASIN_MAP.list({ limit: 1000 });
    const results = [];

    for (const { name: asin } of list.keys) {
      const probeUrl = `https://${env.HOSTNAME || 'alayainsider.com'}/go/${asin}`;
      try {
        const r = await fetch(probeUrl, {
          method: 'GET',
          redirect: 'manual',
          headers: { 'user-agent': 'alaya-healthcheck/1.0 (+https://alayainsider.com)' }
        });

        const loc = r.headers.get('location') || '';
        const is302            = r.status === 302;
        const locationIsAmazon = /^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?/.test(loc);
        const tagOk            = loc.includes('tag=' + encodeURIComponent(env.AMAZON_TAG || ''));
        const noShortener      = !/bit\.ly|t\.co|tinyurl|ow\.ly|buff\.ly|amzn\.to/i.test(loc);

        results.push({
          asin,
          status: r.status,
          ok: is302 && locationIsAmazon && tagOk && noShortener,
          reason: is302 ? (!locationIsAmazon ? 'destination_not_amazon'
                       : !tagOk            ? 'tag_missing'
                       : !noShortener      ? 'shortener_in_chain'
                       : '') : 'not_302',
          location: loc
        });
      } catch (e) {
        results.push({ asin, status: 0, ok: false, reason: 'fetch_error: ' + e.message });
      }
    }

    await fetch(env.LOG_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-alaya-secret': env.LOG_WEBHOOK_SECRET || ''
      },
      body: JSON.stringify({ kind: 'link_health', results })
    }).catch(() => {});
  }
};

function countryOf(cf) { return (cf && cf.country) || ''; }

function redirectTo(location, extras) {
  const headers = new Headers({
    'Location':            location,
    // No caching of the redirect. Every click must reach this Worker so the
    // log stays complete and a tag correction takes effect instantly.
    'Cache-Control':       'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma':              'no-cache',
    'X-Robots-Tag':        'noindex, nofollow, noarchive',
    'X-Alaya-Redirect':    'single-hop',
    'Referrer-Policy':     'no-referrer-when-downgrade'
  });

  if (extras && extras.role === 'health') {
    headers.set('X-Alaya-Matched', extras.asin || '');
  }

  return new Response(null, { status: 302, headers });
}
