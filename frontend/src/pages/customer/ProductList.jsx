import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { productApi, storeApi } from '../../api/endpoints';
import ProductCard from '../../components/ProductCard';
import PageHeader from '../../components/PageHeader';
import { ProductGridSkeleton } from '../../components/Skeleton';
import { FilterIcon, SortIcon, StoreIcon, CloseIcon } from '../../components/Icons';
import { usePreviewNotice } from '../../context/PreviewNoticeContext';

const SORT_OPTIONS = [
  { value: '', label: 'Standart' },
  { value: 'price_asc', label: 'Arzon narx' },
  { value: 'price_desc', label: 'Qimmat narx' },
  { value: 'name_asc', label: "Nomi bo'yicha (A-Z)" },
];

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const page = Number(params.get('page') || 1);
  const search = params.get('search') || '';
  const categoryId = params.get('category') || '';
  // Coming from the catalog tree, a category with sub-categories asks for
  // "this category + all of its descendants". The /products endpoint only
  // filters by one exact category id, so a comma list of ids here means
  // "fetch each of these separately and merge" instead of the normal
  // single-request, server-paginated flow below.
  const categoryIds = useMemo(() => {
    const raw = params.get('categories');
    return raw ? raw.split(',').map((v) => v.trim()).filter(Boolean) : [];
  }, [params]);
  const multiMode = categoryIds.length > 0;
  const storeId = params.get('store') || '';
  const { notify } = usePreviewNotice();

  const [stores, setStores] = useState([]);
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const sortRef = useRef(null);
  const storePickerRef = useRef(null);
  const sortTriggerRef = useRef(null);
  const storeTriggerRef = useRef(null);

  // Multi-category mode state: merged results accumulate here instead of
  // in `data`, since there's no single "page N of the combined set" the
  // backend can give us.
  const [multiItems, setMultiItems] = useState([]);
  const [multiPage, setMultiPage] = useState(1);
  const [multiHasMore, setMultiHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    storeApi.list({ page: 1 }).then(({ data }) => setStores(data?.results || [])).catch(() => {});
  }, []);

  // Close the sort/store dropdowns on an outside click or Escape — without
  // this they only closed by re-clicking their own trigger, which is easy
  // to miss and leaves a stray panel covering the page.
  useEffect(() => {
    if (!sortOpen && !storePickerOpen) return;
    const onPointerDown = (e) => {
      if (
        sortOpen &&
        !sortRef.current?.contains(e.target) &&
        !sortTriggerRef.current?.contains(e.target)
      ) setSortOpen(false);
      if (
        storePickerOpen &&
        !storePickerRef.current?.contains(e.target) &&
        !storeTriggerRef.current?.contains(e.target)
      ) setStorePickerOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setSortOpen(false); setStorePickerOpen(false); }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [sortOpen, storePickerOpen]);

  // Single category (or no category) — the normal server-paginated path.
  useEffect(() => {
    if (multiMode) return;
    let cancelled = false;
    setLoading(true);
    productApi
      .list({ page, search: search || undefined, category: categoryId || undefined, store: storeId || undefined })
      .then(({ data }) => { if (!cancelled) setData(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [multiMode, page, search, categoryId, storeId]);

  // Multi-category — fetch page 1 of each category id in parallel and merge.
  // A product that sits directly in more than one of the selected categories
  // would otherwise appear twice, so results are de-duplicated by id.
  useEffect(() => {
    if (!multiMode) return;
    let cancelled = false;
    setLoading(true);
    setMultiPage(1);
    Promise.all(
      categoryIds.map((id) =>
        productApi
          .list({ page: 1, search: search || undefined, category: id, store: storeId || undefined })
          .catch(() => null)
      )
    ).then((responses) => {
      if (cancelled) return;
      const seen = new Set();
      const merged = [];
      responses.forEach((res) => {
        (res?.data?.results || []).forEach((p) => {
          if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
        });
      });
      setMultiItems(merged);
      setMultiHasMore(responses.some((res) => Boolean(res?.data?.next)));
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiMode, categoryIds.join(','), search, storeId]);

  const loadMoreMulti = async () => {
    const nextPage = multiPage + 1;
    setLoadingMore(true);
    try {
      const responses = await Promise.all(
        categoryIds.map((id) =>
          productApi
            .list({ page: nextPage, search: search || undefined, category: id, store: storeId || undefined })
            .catch(() => null)
        )
      );
      setMultiItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        responses.forEach((res) => {
          (res?.data?.results || []).forEach((p) => {
            if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
          });
        });
        return merged;
      });
      setMultiHasMore(responses.some((res) => Boolean(res?.data?.next)));
      setMultiPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const sortedResults = useMemo(() => {
    const baseResults = multiMode ? multiItems : (data.results || []);
    const list = [...baseResults];
    if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [multiMode, multiItems, data.results, sort]);

  const selectStore = (id) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set('store', String(id)); else next.delete('store');
      next.set('page', '1');
      return next;
    });
    setStorePickerOpen(false);
  };

  const goPage = (next) => setParams((prev) => { const p = new URLSearchParams(prev); p.set('page', String(next)); return p; });

  const clearFilters = () => {
    setSort('');
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    setParams(next);
  };

  const activeStore = stores.find((s) => String(s.id) === storeId);
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;
  const title = location.state?.categoryName || (search ? `"${search}" uchun natijalar` : 'Mahsulotlar');
  const hasActiveFilter = categoryId || multiMode || storeId || sort;

  return (
    <div className="page">
      <PageHeader title={title} />

      <div className="container">
        {search && (
          <div className="catalog-search-chip">
            <span>Qidiruv: <strong>{search}</strong></span>
            <button
              type="button"
              aria-label="Qidiruvni tozalash"
              onClick={() => setParams((prev) => { const n = new URLSearchParams(prev); n.delete('search'); n.set('page', '1'); return n; })}
            >
              <CloseIcon width={13} height={13} />
            </button>
          </div>
        )}

        <div className="catalog-filter-row">
          <button type="button" className="catalog-filter-chip" onClick={() => notify("Qo'shimcha filtrlar (narx, o'lcham) tez orada qo'shiladi.")}>
            <FilterIcon width={15} height={15} /> Filtr
          </button>
          <button type="button" className="catalog-filter-chip" ref={sortTriggerRef} onClick={() => setSortOpen((v) => !v)}>
            <SortIcon width={15} height={15} /> {activeSortLabel && sort ? activeSortLabel : 'Saralash'}
          </button>
          <button type="button" className="catalog-filter-chip" ref={storeTriggerRef} onClick={() => setStorePickerOpen((v) => !v)}>
            <StoreIcon width={15} height={15} /> {activeStore ? activeStore.name : "Do'kon"}
          </button>
          {hasActiveFilter && (
            <button type="button" className="catalog-filter-chip catalog-filter-clear" onClick={clearFilters}>
              <CloseIcon width={13} height={13} /> Tozalash
            </button>
          )}
        </div>

        {sortOpen && (
          <div className="catalog-dropdown" ref={sortRef}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`catalog-dropdown-item${sort === opt.value ? ' active' : ''}`}
                onClick={() => { setSort(opt.value); setSortOpen(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        {storePickerOpen && (
          <div className="catalog-dropdown" ref={storePickerRef}>
            <button type="button" className={`catalog-dropdown-item${!storeId ? ' active' : ''}`} onClick={() => selectStore('')}>
              Barcha do'konlar
            </button>
            {stores.map((s) => (
              <button key={s.id} type="button" className={`catalog-dropdown-item${storeId === String(s.id) ? ' active' : ''}`} onClick={() => selectStore(s.id)}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <ProductGridSkeleton count={8} />
          </div>
        ) : sortedResults.length === 0 ? (
          <div className="empty-state card"><h3>Mahsulot topilmadi</h3><p>Filtrlarni o'zgartirib ko'ring.</p></div>
        ) : (
          <>
            <div className="grid grid-products" style={{ marginTop: 'var(--sp-4)' }}>
              {sortedResults.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {multiMode ? (
              multiHasMore && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--sp-6)' }}>
                  <button className="btn btn-outline btn-sm" disabled={loadingMore} onClick={loadMoreMulti}>
                    {loadingMore ? 'Yuklanmoqda...' : 'Yana yuklash'}
                  </button>
                </div>
              )
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)' }}>
                <button className="btn btn-outline btn-sm" disabled={!data.previous} onClick={() => goPage(page - 1)}>Oldingi</button>
                <span style={{ alignSelf: 'center', fontSize: 'var(--fs-sm)', color: 'var(--color-ink-soft)' }}>{page}-sahifa</span>
                <button className="btn btn-outline btn-sm" disabled={!data.next} onClick={() => goPage(page + 1)}>Keyingi</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
