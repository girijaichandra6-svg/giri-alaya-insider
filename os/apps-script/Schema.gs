/** Schema.gs — Alaya Insider Product OS / canonical schema + state machine.
 *  Bump SCHEMA_VERSION only with a CEO-signed change. Never rename PRODUCTS_COLUMNS
 *  in place; additions append to the end only. */

const SCHEMA_VERSION = '2.0.1';
// OWNER RULING (locked): the enumerated table is authoritative → 27 columns.
// If a 28th is ever added, APPEND it at the end and bump this constant.
const EXPECTED_PRODUCT_COL_COUNT = 27;

const SHEET_NAMES = Object.freeze({
  PRODUCTS:  'Products',
  PIPELINE:  'Pipeline',
  CLAIMS:    'Claims Audit',
  REFS:      'Creative Refs',
  ASSETS:    'Assets',
  DECISIONS: 'Decisions',
  DIGEST:    'CEO Digest',
  METRICS:   'Metrics'
});

const PRODUCTS_COLUMNS = Object.freeze([
  'name','brand','category','subcategory','price','previous_price','currency',
  'rating','review_count','description','why_we_recommend','best_for','benefits',
  'pros','cons','buying_advice','affiliate_url','marketplace','affiliate_network',
  'cta_text','sku','status','is_featured','is_trending','is_editors_pick',
  'seo_title','seo_description'
]);
const PRODUCTS_COL_IDX = (function(){
  const m = {}; PRODUCTS_COLUMNS.forEach((c,i) => { m[c] = i + 1; }); return m;
})();

const PIPELINE_COLUMNS = Object.freeze([
  'sku','asin','url','niche_weight_at_intake','selection_score','hard_gate_fails',
  'category_rate','commission_per_order','epk_est','price_p30_12mo','price_history_src',
  'stock_status','stock_stability_30d','seller_type','review_velocity_30d',
  'top_1star_complaints','safety_flag','demand_evidence','hook_thesis','objections_top3',
  'demo_score','trial_price_at_publish','last_reverify','reverify_trigger',
  'cost_to_date','state','state_ts','actor','note'
]);

const CLAIMS_COLUMNS = Object.freeze([
  'sku','claim_text','claim_type','source_url','source_type','confidence',
  'auditor','verdict','fix_applied'
]);

const REFS_COLUMNS = Object.freeze([
  'sku','ref_no','platform','creator_url','views','likes','engagement_rate',
  'hook_exact_first_line','hook_type','format','length_s','audio','cta',
  'cover_note','posted_date','why_viral_3','what_to_steal','score'
]);

const ASSETS_COLUMNS = Object.freeze([
  'asset_id','sku','type','platform','hook_no','hook_line','status','rendered_at',
  'published_at','hold3','views_7d','ctr','clicks','orders','revenue','epk',
  'spend','verdict','learn_one_liner'
]);

const DECISIONS_COLUMNS = Object.freeze([
  'ts','sku','actor','decision','reason_code','note','agent_countermeasure'
]);

const DIGEST_COLUMNS = Object.freeze([
  'date','scored_today','passed_gates','pending_approval_top10','published_yesterday',
  'clicks_24h','revenue_24h','epk_7d','api_health_orders_30d','cost_burn_vs_cap',
  'risk_flags','recommendations_3','probation_status'
]);

// Working shape — Metrics is "raw daily snapshots per sku × platform".
const METRICS_COLUMNS = Object.freeze([
  'date','sku','platform','asset_id','views','clicks','orders','revenue',
  'epc','spend','notes'
]);

const COLUMNS_BY_SHEET = Object.freeze({
  'Products':      PRODUCTS_COLUMNS,
  'Pipeline':      PIPELINE_COLUMNS,
  'Claims Audit':  CLAIMS_COLUMNS,
  'Creative Refs': REFS_COLUMNS,
  'Assets':        ASSETS_COLUMNS,
  'Decisions':     DECISIONS_COLUMNS,
  'CEO Digest':    DIGEST_COLUMNS,
  'Metrics':       METRICS_COLUMNS
});

const STATUS_ENUM = Object.freeze([
  'DISCOVERED','SCORED','VERIFIED','RESEARCHED','CREATIVES_READY','RENDERED',
  'COMPLIANCE_PASS','PENDING_APPROVAL','APPROVED','PUBLISHED','MONITORING',
  'VERDICTED','REJECTED','KILLED','PULLED','EXPIRED','HOLD'
]);
const CATEGORY_ENUM = Object.freeze(['Fashion','Home','Beauty','Electronics','Travel','Lifestyle']);

const SUBCATEGORY_BY_CATEGORY = Object.freeze({
  Fashion:     ['Dresses','Tops','Co-ords','Workwear','Shoes','Bags','Accessories'],
  Home:        ['Living Room','Bedroom','Kitchen','Decor','Lighting','Organization','Furniture'],
  Beauty:      ['Skincare','Makeup','Haircare','Body Care','Fragrance','Beauty Tools','Wellness'],
  Electronics: ['Headphones','Smart Home','Computers','Phone Accessories','Wearables','Home Tech','Audio'],
  Travel:      ['Luggage','Carry-On','Travel Bags','Travel Accessories','Packing','Travel Tech','Weekend Essentials'],
  Lifestyle:   ['Wellness','Fitness','Everyday Essentials','Desk & Office','Gifts','Self Care','Outdoor Living']
});

const REJECT_CODES = Object.freeze({
  C1:'wrong product/angle', C2:'price/deal not compelling', C3:'hook weak',
  C4:'script off-voice', C5:'compliance concern', C6:'category/brand fit doubt',
  C7:'visual/brand aesthetic', C8:'timing', C9:'duplicate of recent',
  C10:'brand risk', C11:'claims overreach', C12:'disclosure issue',
  C13:'too many assets (publish subset)', C14:'audience mismatch',
  C15:'save for later window'
});

// Roles. Individual agents bucket into exactly one of these.
const ROLE_BUCKETS = Object.freeze(['OWNER','CEO','PIPELINE','SYSTEM']);

// TRANSITIONS[from][to] = roles allowed to make the change.
// APPROVED exists in exactly one cell: PENDING_APPROVAL → APPROVED, OWNER only.
const TRANSITIONS = Object.freeze({
  DISCOVERED:      {SCORED:['PIPELINE'], HOLD:['CEO'], REJECTED:['OWNER'], KILLED:['PIPELINE']},
  SCORED:          {VERIFIED:['PIPELINE'], HOLD:['CEO'], REJECTED:['OWNER'], KILLED:['PIPELINE']},
  VERIFIED:        {RESEARCHED:['PIPELINE'], HOLD:['CEO'], REJECTED:['OWNER'], KILLED:['PIPELINE']},
  RESEARCHED:      {CREATIVES_READY:['PIPELINE'], HOLD:['CEO'], REJECTED:['OWNER'], KILLED:['PIPELINE']},
  CREATIVES_READY: {RENDERED:['PIPELINE'], HOLD:['CEO'], REJECTED:['OWNER'], KILLED:['PIPELINE']},
  RENDERED:        {COMPLIANCE_PASS:['PIPELINE'], HOLD:['CEO'], REJECTED:['OWNER'], KILLED:['PIPELINE']},
  COMPLIANCE_PASS: {PENDING_APPROVAL:['CEO'], HOLD:['CEO'], REJECTED:['OWNER'], KILLED:['PIPELINE']},
  PENDING_APPROVAL:{APPROVED:['OWNER'], REJECTED:['OWNER'], EXPIRED:['SYSTEM'], HOLD:['CEO']},
  APPROVED:        {PUBLISHED:['PIPELINE'], PULLED:['PIPELINE','SYSTEM'], HOLD:['CEO'], REJECTED:['OWNER']},
  PUBLISHED:       {MONITORING:['PIPELINE'], PULLED:['PIPELINE','SYSTEM'], KILLED:['PIPELINE'], HOLD:['CEO']},
  MONITORING:      {VERDICTED:['PIPELINE'], KILLED:['PIPELINE'], PULLED:['PIPELINE','SYSTEM'], HOLD:['CEO']},
  VERDICTED:       {HOLD:['CEO']},
  REJECTED:        {HOLD:['CEO']},
  KILLED:          {HOLD:['CEO']},
  PULLED:          {},                 // restore via pulled_from_<sku>
  EXPIRED:         {PENDING_APPROVAL:['CEO'], REJECTED:['OWNER']},
  HOLD:            {}                  // un-hold via hold_from_<sku>
});
