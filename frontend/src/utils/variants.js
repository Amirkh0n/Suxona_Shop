// Product variants carry free-form `attributes` (e.g. {"rang": "Qora", "o'lcham": "M"}).
// These helpers turn them into something readable and pick the right price/stock.

export function formatAttributes(attributes) {
  if (!attributes || typeof attributes !== 'object') return '';
  return Object.entries(attributes)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}

export function variantLabel(variant) {
  if (!variant) return '';
  return formatAttributes(variant.attributes) || variant.sku;
}

// Price actually charged for a cart/order line: variant's effective price, else product price.
export function linePrice(item) {
  return Number(item?.variant?.effective_price ?? item?.product?.price ?? 0);
}

// Stock limit for a purchasable thing; null = unlimited.
export function availableStock(product, variant) {
  const stock = variant ? variant.stock : product?.stock;
  return stock == null ? null : stock;
}
