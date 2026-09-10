/**
 * Publish.gs — fires a site rebuild/revalidation hook when a row reaches APPROVED.
 * Called from applyStatusTransition_ (Guards.gs) and handleTransition_ (WebhookExt.gs).
 * Does NOT publish anything itself — it notifies the site pipeline.
 */

function onRowApproved_(sku) {
  const hook = PropertiesService.getScriptProperties().getProperty('SITE_BUILD_HOOK') || '';
  if (!hook) return;
  try {
    UrlFetchApp.fetch(hook, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ event: 'approved', sku, ts: new Date().toISOString() }),
      muteHttpExceptions: true
    });
  } catch (_) {}
}
