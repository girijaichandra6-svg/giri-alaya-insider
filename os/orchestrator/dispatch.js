import { runIntake }       from './intake.js';
import { runMonitorBatch } from './monitors_cron.js';
import { runOneRow }       from './run_one_row.js';
import { SheetClient }     from './sheet_client.js';
import { CostMeter }       from './cost_meter.js';
import { CONFIG }          from './config.js';

const schedule = process.env.GITHUB_EVENT_SCHEDULE || '';
const sheet    = new SheetClient(CONFIG);
const meter    = new CostMeter(CONFIG, sheet);

(async function main() {
  if (schedule === CONFIG.cadence.intake)  await intakePass(sheet, meter);
  if (schedule === CONFIG.cadence.hourly)  await monitorPass('hourly', sheet, meter);
  if (schedule === CONFIG.cadence.daily)   await monitorPass('daily',  sheet, meter);
  if (schedule === CONFIG.cadence.weekly)  await monitorPass('weekly', sheet, meter);
})().catch(e => { console.error(e); process.exit(1); });

async function intakePass(sheet, meter) {
  const candidates = await loadCandidatesFromPipelineSource();
  const { promoted } = await runIntake(sheet, candidates, meter);
  for (const c of promoted) await driveRow(sheet, c.sku, meter);
}

async function monitorPass(cadence, sheet, meter) {
  const results = await runMonitorBatch(cadence, buildCtx(sheet, meter));
  for (const { monitor, events, error } of results) {
    if (error) console.error('[monitor]', monitor, error);
    for (const ev of (events || [])) await applyMonitorEvent(sheet, monitor, ev);
  }
}

/** Walk one row as far as it goes in this run. Each step is one state advance. */
async function driveRow(sheet, sku, meter) {
  for (let i = 0; i < 8; i++) {
    const row = await sheet.getRow(sku);
    if (!row || !row.status) return;
    if (row.status === 'PENDING_APPROVAL') return;  // Owner gate. Stop.
    if (['APPROVED', 'PUBLISHED', 'MONITORING', 'VERDICTED', 'HOLD',
         'PULLED', 'REJECTED', 'KILLED', 'EXPIRED'].includes(row.status)) return;
    const res = await runOneRow(sheet, row, buildRunDeps(meter));
    if (!res.advanced) return;
  }
}

function buildRunDeps(meter) {
  return {
    actorPipeline: CONFIG.actors.pipeline,
    actorCeo:      CONFIG.actors.ceo,
    meter,
    cache: {},
    fetchDeps: { /* populated from env at runtime: fetcher mode + keys */ },
    research:       async (row) => ({ /* wired to your LLM step */ }),
    refs:           async (row) => ({ /* wired to your viral-ref finder */ }),
    render:         async (row) => ({ /* wired to your renderer */ }),
    complianceCtx:  async (row) => ({ /* assembled from live checks */ }),
    ceoDigest:      async (row) => 'signed'
  };
}

function buildCtx(sheet, meter) {
  return {
    listProducts: async (f) => sheet.listRows(f),
    listAssets:   async (_f) => [],           // Assets tab query — wire when assets exist
    fetchLivePrice:  async () => null,        // wire to adapters
    fetchLiveStock:  async () => null,
    fetchLiveRating: async () => null,
    checkAsin:       async () => ({ alive: true }),
    fetchHead:       async (url) => fetch(url, { method: 'HEAD', redirect: 'manual' }),
    fetchHtml:       async (url) => (await fetch(url)).text(),
    writePrice:      async () => {},
    pulledReason:    () => '',
    orders30:        process.env.ORDERS_30 ? Number(process.env.ORDERS_30) : null,
    cost:            { spendUsd: meter.spend.month, capDailyUsd: CONFIG.cost.monthlyCapUsd / 30 },
    sheetClicks24h: null, csvClicks24h: null, goClicks24h: null
  };
}

async function applyMonitorEvent(sheet, monitor, ev) {
  if (!ev || !ev.sku) return;
  const map = {
    PULL:    { to: 'PULLED',   actor: 'PIPELINE' },
    HOLD:    { to: 'HOLD',     actor: 'CEO'      },
    EXPIRE:  { to: 'EXPIRED',  actor: 'SYSTEM'   },
    RESTORE: null,   // handled by monitor via pulled_from
    FLAG:    null,   // logged only
    FULL_PIPELINE_ALERT: null,
    WEEKLY_WARNING: null,
    FREEZE_INTAKE: null
  };
  const target = map[ev.action];
  if (!target) {
    await sheet.writeDecision({ sku: ev.sku, actor: 'SYSTEM', decision: 'FLAG',
      reason_code: monitor + '_' + ev.action, note: (ev.reason || '').slice(0, 200) });
    return;
  }
  const row = await sheet.getRow(ev.sku);
  if (!row || !row.status) return;
  await sheet.transition({ sku: ev.sku, from: row.status, to: target.to,
    actor: target.actor, note: monitor + ':' + ev.reason });
}

async function loadCandidatesFromPipelineSource() {
  // Wire to your discovery source. For the manual first run, candidates enter
  // via operators/manual_capture — see the guide's Stage 7.
  return [];
}
