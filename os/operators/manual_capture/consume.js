/** Glue: turn a validated manual capture into the shape Data Fill expects (Module 15). */
import { validateManualCapture } from './manual_validation.js';
import { AmazonPageFetcher }     from '../../agents/fetchers/amazon_page.js';
import { PriceHistoryFetcher }   from '../../agents/fetchers/price_history.js';
import { fillProductRow }        from '../../agents/data_fill.js';
import fs                        from 'node:fs';

export async function consumeCapture(capturePath, rowMeta) {
  const cap = JSON.parse(fs.readFileSync(capturePath, 'utf8'));
  const v = validateManualCapture(cap);
  if (!v.ok) return { ok: false, errs: v.errs };

  const amazonFetcher  = new AmazonPageFetcher({ mode: 'manual',
    pasted: { [cap.asin]: {
      title: cap.fields.title, brand: cap.fields.brand,
      price: cap.fields.price, rating: cap.fields.rating,
      review_count: cap.fields.review_count, page_hash: cap.page_hash } } });

  const historyFetcher = new PriceHistoryFetcher({ endpoint: null });

  const row = await fillProductRow({
    asin: cap.asin, category: rowMeta.category, subcategory: rowMeta.subcategory
  }, { amazonFetcher, historyFetcher });

  return { ok: true, row };
}
