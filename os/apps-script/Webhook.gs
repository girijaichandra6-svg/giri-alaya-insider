/**
 * Webhook.gs — click/link-health handlers for the /go/ layer (Module 2).
 * NOTE: doPost is defined ONCE in WebhookExt.gs, which routes clicks
 * (GO_WEBHOOK_SECRET) and orchestrator actions (STATE_WEBHOOK_SECRET).
 * This file holds the handler functions only.
 */

function handleClick(ss, body) {
  const sh = ensureRawClicksTab_(ss);
  sh.appendRow([
    body.ts ? new Date(body.ts) : new Date(),
    body.asin || '', body.sku || '', body.status || '',
    body.utm_source || '', body.utm_medium || '', body.utm_campaign || '',
    body.utm_content || '', body.utm_term || '',
    body.country || '', body.colo || '', body.referer || '', body.ua || ''
  ]);
}

function handleLinkHealth(ss, results) {
  const sh = ensureLinkHealthTab_(ss);
  results.forEach(r => {
    sh.appendRow([new Date(), r.asin, r.status, r.ok, r.reason || '', r.location || '']);
  });
  results.filter(r => !r.ok).forEach(r => {
    logDecision_('AL-' + r.asin, 'SYSTEM', 'FLAG', 'LINK_HEALTH_FAIL',
      'status=' + r.status + ' reason=' + r.reason + ' loc=' + (r.location || '').slice(0, 200));
  });
}

function ensureRawClicksTab_(ss) {
  let sh = ss.getSheetByName('Raw Clicks');
  if (!sh) {
    sh = ss.insertSheet('Raw Clicks');
    sh.getRange(1, 1, 1, 13).setValues([[
      'ts','asin','sku','status','utm_source','utm_medium','utm_campaign',
      'utm_content','utm_term','country','colo','referer','user_agent'
    ]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function ensureLinkHealthTab_(ss) {
  let sh = ss.getSheetByName('Link Health');
  if (!sh) {
    sh = ss.insertSheet('Link Health');
    sh.getRange(1, 1, 1, 6).setValues([[
      'ts','asin','status_code','ok','reason','location'
    ]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Run once from the editor to set the shared secret for click logging. */
function setWebhookSecret(value) {
  PropertiesService.getScriptProperties().setProperty('GO_WEBHOOK_SECRET', value || '');
}
