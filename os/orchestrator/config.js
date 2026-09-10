export const CONFIG = {
  sheetWebhook: process.env.SHEET_WEBHOOK_URL,
  stateSecret:  process.env.STATE_WEBHOOK_SECRET,
  actors: {
    pipeline: 'pipeline@alayainsider.com',
    ceo:      'ceo@alayainsider.com'
  },
  cost: {
    perAsinCapUsd:         8,
    monthlyCapUsd:         2000,
    probationSprintCapUsd: 300
  },
  cadence: {
    intake:  '0 */6 * * *',
    hourly:  '0 * * * *',
    daily:   '0 9 * * *',
    weekly:  '0 22 * * 5'
  }
};
