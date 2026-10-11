import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categoryApi, productApi, storeApi } from '../../api/endpoints';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/Skeleton';
import Spinner from '../../components/Spinner';
import { SearchIcon, FilterIcon, SortIcon, StoreIcon, CloseIcon } from '../../components/Icons';
import { usePreviewNotice } from '../../context/PreviewNoticeContext';

const SORT_OPTIONS = [
  { value: '', label: 'Standart' },
  { value: 'price_asc', label: 'Arzon narx' },
  { value: 'price_desc', label: 'Qimmat narx' },
  { value: 'name_asc', label: "Nomi bo'yicha (A-Z)" },
];

export default function ProductList() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 1);
  const search = params.get('search') || '';
  const categoryId = params.get('category') || '';
  const storeId = params.get('store') || '';
  const { notify } = usePreviewNotice();

  const [searchInput, setSearchInput] = useState(search);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data?.results || [])).catch(() => {});
    storeApi.list({ page: 1 }).then(({ data }) => setStores(data?.results || [])).catch(() => {});
  }, []);

  useEffect(() => { setSearchInput(search); }, [search]);

  // Debounce the free-text search instead of firing a request on every
  // keystroke — the user only has to press Enter for an instant search,
  // otherwise typing settles for 400ms before a request goes out.
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput) next.set('search', searchInput); else next.delete('search');
        next.set('page', '1');
        return next;
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    productApi
      .list({ page, search: search || undefined, category: categoryId || undefined, store: storeId || undefined })
      .then(({ data }) => { if (!cancelled) setData(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, search, categoryId, storeId]);

  const sortedResults = useMemo(() => {
    const list = [...(data.results || [])];
    if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [data.results, sort]);

  const submitSearch = (e) => {
    e.preventDefault();
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput) next.set('search', searchInput); else next.delete('search');
      next.set('page', '1');
      return next;
    });
  };

  const selectCategory = (id) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set('category', String(id)); else next.delete('category');
      next.set('page', '1');
      return next;
    });
  };

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

  const activeStore = stores.find((s) => String(s.id) === storeId);
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;

  return (
    <div className="page">
      <PageHeaderBar
        title="Katalog"
        count={data.count}
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={submitSearch}
        searching={searchInput !== search}
      />

      <div className="container">
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
          {(categoryId || storeId || sort) && (
            <button
              type="button"
              className="catalog-filter-chip catalog-filter-clear"
              onClick={() => { setSort(''); setParams({}); }}
            >
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

        {categories.length > 0 && (
          <div className="catalog-tabs">
            <button className={`catalog-tab${!categoryId ? ' active' : ''}`} onClick={() => selectCategory('')}>Barchasi</button>
            {categories.filter((c) => !c.parent).map((cat) => (
              <button key={cat.id} className={`catalog-tab${categoryId === String(cat.id) ? ' active' : ''}`} onClick={() => selectCategory(cat.id)}>
                {cat.name}
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
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)' }}>
              <button className="btn btn-outline btn-sm" disabled={!data.previous} onClick={() => goPage(page - 1)}>Oldingi</button>
              <span style={{ alignSelf: 'center', fontSize: 'var(--fs-sm)', color: 'var(--color-ink-soft)' }}>{page}-sahifa</span>
              <button className="btn btn-outline btn-sm" disabled={!data.next} onClick={() => goPage(page + 1)}>Keyingi</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PageHeaderBar({ title, search, onSearchChange, onSearchSubmit, searching }) {
  return (
    <div className="container" style={{ paddingTop: 'var(--sp-4)' }}>
      <h1 style={{ marginBottom: 'var(--sp-4)' }}>{title}</h1>
      <form onSubmit={onSearchSubmit} className="app-search" style={{ marginBottom: 'var(--sp-4)' }}>
        <SearchIcon width={18} height={18} className="app-search-icon" />
        <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Qidiruv..." aria-label="Qidirish" />
        {searching && <span className="app-search-loading"><Spinner size={16} /></span>}
      </form>
    </div>
  );
}
