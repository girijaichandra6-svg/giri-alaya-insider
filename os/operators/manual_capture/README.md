# Manual capture — first real dry run

1. Open the Amazon product page in a logged-out browser window.
2. Screenshot: full page. Save as
   `captures/<ASIN>/page_<YYYYMMDDTHHMMSSZ>.png`
3. Scroll to the price, rating, and review count. Copy them exactly.
4. Right-click the page → View Source → Save as
   `captures/<ASIN>/source_<YYYYMMDDTHHMMSSZ>.html`
5. Compute the hash of the saved source (Git Bash on Windows):
   ```bash
   shasum -a 256 captures/<ASIN>/source_*.html
   ```
   Copy the value, prefix with `sha256:`.
6. Fill `captures/<ASIN>/capture.json` from `template.json`.
7. Run the consumer within 1 hour of capture (stale → UNVERIFIED, row holds):
   ```bash
   node -e "import('./consume.js').then(m => m.consumeCapture('captures/<ASIN>/capture.json', {category:'Home', subcategory:'Kitchen'})).then(console.log)"
   ```

Nothing from this file appears in Products unless the capture passes validation
AND is <1h old at the moment of consumption. That is the design, not a bug.
