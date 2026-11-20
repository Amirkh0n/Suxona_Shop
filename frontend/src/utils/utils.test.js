import { formatSum, isSameDay } from './format';
import { availableStock, formatAttributes, linePrice, variantLabel } from './variants';

describe('format', () => {
  it('formats sums and passes through non-numbers', () => {
    expect(formatSum(12000)).toMatch(/12.000 so'm/);
    expect(formatSum('abc')).toBe('abc');
  });
  it('compares days', () => {
    expect(isSameDay('2026-11-19T10:00:00', new Date('2026-11-19T23:00:00'))).toBe(true);
    expect(isSameDay('2026-11-18T10:00:00', new Date('2026-11-19T00:10:00'))).toBe(false);
    expect(isSameDay(null)).toBe(false);
  });
});

describe('variants', () => {
  it('labels by attributes, falling back to sku', () => {
    expect(formatAttributes({ rang: 'Qora', hajm: '' })).toBe('rang: Qora');
    expect(variantLabel({ attributes: {}, sku: 'S-1' })).toBe('S-1');
  });
  it('prefers the variant price and stock', () => {
    const product = { price: '10', stock: 5 };
    expect(linePrice({ product })).toBe(10);
    expect(linePrice({ product, variant: { effective_price: '12' } })).toBe(12);
    expect(availableStock(product, { stock: null })).toBeNull();
    expect(availableStock(product, null)).toBe(5);
  });
});
