/** Single source of truth for affiliate_url format. Used nowhere else (Module 4). */
export function buildGoUrl(asin) {
  if (!/^[A-Z0-9]{10}$/.test(asin)) throw new Error('BAD_ASIN');
  return 'https://alayainsider.com/go/' + asin;
}
