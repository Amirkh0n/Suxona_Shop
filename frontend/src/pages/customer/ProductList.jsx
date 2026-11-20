import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { productApi, storeApi } from '../../api/endpoints';
import ProductCard from '../../components/ProductCard';
import PageHeader from '../../components/PageHeader';
import { ProductGridSkeleton } from '../../components/Skeleton';
import { FilterIcon, SortIcon, StoreIcon, CloseIcon } from '../../components/Icons';
import { useI18n } from '../../i18n';

const SORTS = ['new', 'price_asc', 'price_desc', 'popular', 'discount', 'rating'];

// Every filter lives in the URL, so results are shareable and survive reloads.
export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const { t } = useI18n();

  const page = Number(params.get('page') || 1);
  const search = params.get('search') || '';
  const categories = params.get('categories') || params.get('category') || '';
  const storeId = params.get('store') || '';
  const ordering = params.get('ordering') || '';
  const minPrice = params.get('min_price') || '';
  const maxPrice = params.get('max_price') || '';
  const inStock = params.get('in_stock') === 'true';
  const onSale = params.get('on_sale') === 'true';

  const [stores, setStores] = useState([]);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState({ min: '', max: '', inStock: false, onSale: false });
  const dropdownRef = useRef(null);

  useEffect(() => {
    storeApi.list({ page: 1 }).then(({ data }) => setStores(data?.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    productApi
      .list({
        page,
        search: search || undefined,
        categories: categories || undefined,
        store: storeId || undefined,
        ordering: ordering || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        in_stock: inStock || undefined,
        on_sale: onSale || undefined,
      })
      .then(({ data }) => { if (!cancelled) setData(data); })
      .catch(() => { if (!cancelled) setData({ results: [], count: 0 }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, search, categories, storeId, ordering, minPrice, maxPrice, inStock, onSale]);

  useEffect(() => {
    if (!sortOpen && !storeOpen) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !dropdownRef.current?.contains(e.target) && !e.target.closest('.catalog-filter-chip')) {
        setSortOpen(false); setStoreOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [sortOpen, storeOpen]);

  const update = (changes) => {
    setLoading(true);
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries({ page: '1', ...changes }).forEach(([k, v]) => {
        if (v === '' || v === false || v == null) next.delete(k); else next.set(k, String(v));
      });
      return next;
    });
  };

  const openSheet = () => {
    setDraft({ min: minPrice, max: maxPrice, inStock, onSale });
    setSheetOpen(true);
  };
  const applySheet = () => {
    update({ min_price: draft.min, max_price: draft.max, in_stock: draft.inStock, on_sale: draft.onSale });
    setSheetOpen(false);
  };

  const clearAll = () => {
    setLoading(true);
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    setParams(next);
  };

  const activeStore = stores.find((s) => String(s.id) === storeId);
  const title = location.state?.categoryName || (search ? t('list.resultsFor', { q: search }) : t('list.title'));
  const filterCount = [minPrice || maxPrice, inStock, onSale].filter(Boolean).length;
  const hasActive = categories || storeId || ordering || filterCount;
  const results = data.results || [];

  return (
    <div className="page">
      <PageHeader title={title} />
      <div className="container">
        {search && (
          <div className="catalog-search-chip">
            <span>{search}</span>
            <button type="button" aria-label="Clear search" onClick={() => update({ search: '' })}>
              <CloseIcon width={13} height={13} />
            </button>
          </div>
        )}

        <div className="catalog-filter-row">
          <button type="button" className="catalog-filter-chip" onClick={openSheet}>
            <FilterIcon width={15} height={15} /> {t('list.filter')}{filterCount > 0 ? ` (${filterCount})` : ''}
          </button>
          <button type="button" className="catalog-filter-chip" onClick={() => { setSortOpen((v) => !v); setStoreOpen(false); }}>
            <SortIcon width={15} height={15} /> {ordering ? t(`sort.${ordering}`) : t('list.sort')}
          </button>
          <button type="button" className="catalog-filter-chip" onClick={() => { setStoreOpen((v) => !v); setSortOpen(false); }}>
            <StoreIcon width={15} height={15} /> {activeStore ? activeStore.name : t('list.store')}
          </button>
          {hasActive && (
            <button type="button" className="catalog-filter-chip catalog-filter-clear" onClick={clearAll}>
              <CloseIcon width={13} height={13} /> {t('list.clear')}
            </button>
          )}
        </div>

        {sortOpen && (
          <div className="catalog-dropdown" ref={dropdownRef}>
            {SORTS.map((value) => (
              <button key={value} type="button" className={`catalog-dropdown-item${(ordering || 'new') === value ? ' active' : ''}`}
                onClick={() => { update({ ordering: value === 'new' ? '' : value }); setSortOpen(false); }}>
                {t(`sort.${value}`)}
              </button>
            ))}
          </div>
        )}
        {storeOpen && (
          <div className="catalog-dropdown" ref={dropdownRef}>
            <button type="button" className={`catalog-dropdown-item${!storeId ? ' active' : ''}`} onClick={() => { update({ store: '' }); setStoreOpen(false); }}>
              {t('list.allStores')}
            </button>
            {stores.map((s) => (
              <button key={s.id} type="button" className={`catalog-dropdown-item${storeId === String(s.id) ? ' active' : ''}`}
                onClick={() => { update({ store: s.id }); setStoreOpen(false); }}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ marginTop: 'var(--sp-4)' }}><ProductGridSkeleton count={8} /></div>
        ) : results.length === 0 ? (
          <div className="empty-state card"><h3>{t('list.empty')}</h3><p>{t('list.emptyHint')}</p></div>
        ) : (
          <>
            <div className="grid grid-products" style={{ marginTop: 'var(--sp-4)' }}>
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)' }}>
              <button className="btn btn-outline btn-sm" disabled={!data.previous} onClick={() => update({ page: page - 1 })}>{t('list.prev')}</button>
              <span style={{ alignSelf: 'center', fontSize: 'var(--fs-sm)', color: 'var(--color-ink-soft)' }}>{t('list.page', { n: page })}</span>
              <button className="btn btn-outline btn-sm" disabled={!data.next} onClick={() => update({ page: page + 1 })}>{t('list.next')}</button>
            </div>
          </>
        )}
      </div>

      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="sheet" role="dialog" aria-label={t('filter.title')} onClick={(e) => e.stopPropagation()}>
            <div className="sheet-title">{t('filter.title')}</div>
            <div className="field">
              <label>{t('filter.price')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" min="0" inputMode="numeric" placeholder={t('filter.from')} value={draft.min} onChange={(e) => setDraft({ ...draft, min: e.target.value })} />
                <input type="number" min="0" inputMode="numeric" placeholder={t('filter.to')} value={draft.max} onChange={(e) => setDraft({ ...draft, max: e.target.value })} />
              </div>
            </div>
            <label className="sheet-check"><input type="checkbox" checked={draft.inStock} onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })} /> {t('filter.inStock')}</label>
            <label className="sheet-check"><input type="checkbox" checked={draft.onSale} onChange={(e) => setDraft({ ...draft, onSale: e.target.checked })} /> {t('filter.onSale')}</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 'var(--sp-4)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setDraft({ min: '', max: '', inStock: false, onSale: false })}>{t('filter.reset')}</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={applySheet}>{t('filter.apply')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
