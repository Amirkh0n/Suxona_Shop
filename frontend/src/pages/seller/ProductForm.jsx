import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, productApi, variantApi } from '../../api/endpoints';
import ConfirmDialog from '../../components/ConfirmDialog';
import { variantLabel } from '../../utils/variants';
import { extractErrorMessage } from '../../api/client';
import { resolveImageUrl } from '../../utils/media';
import { PageSpinner } from '../../components/Spinner';
import { PlusIcon, TrashIcon } from '../../components/Icons';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Qoralama' },
  { value: 'ACTIVE', label: 'Faol' },
  { value: 'HIDDEN', label: 'Yashirilgan' },
  { value: 'OUT_OF_STOCK', label: 'Tugagan' },
];

export default function SellerProductForm() {
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category_id: '', name: '', description: '', price: '', stock: '', status: 'ACTIVE' });
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data?.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    productApi.retrieve(productId).then(({ data }) => {
      if (cancelled) return;
      setForm({
        category_id: String(data.category?.id || ''),
        name: data.name || '',
        description: data.description || '',
        price: data.price || '',
        stock: data.stock ?? '',
        status: data.status || 'ACTIVE',
      });
      setImages(data.images || []);
      setVariants(data.variants || []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [productId, isEdit]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        category_id: Number(form.category_id),
        name: form.name,
        description: form.description,
        price: form.price,
        stock: form.stock === '' ? null : Number(form.stock),
      };
      if (isEdit) {
        await productApi.update(productId, { ...payload, status: form.status });
        navigate('/sotuvchi/mahsulotlar');
      } else {
        const { data } = await productApi.create(payload);
        // Switch into edit mode on the new product so images can be uploaded.
        navigate(`/sotuvchi/mahsulotlar/${data.id}`, { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Saqlashda xatolik yuz berdi.'));
    } finally {
      setSaving(false);
    }
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !isEdit) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('is_primary', String(images.length === 0));
      fd.append('sort_order', String(images.length));
      const { data } = await productApi.uploadImage(productId, fd);
      setImages((prev) => [...prev, data]);
    } catch (err) {
      setError(extractErrorMessage(err, 'Rasm yuklashda xatolik yuz berdi.'));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (imageId) => {
    try {
      await productApi.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError("Rasmni o'chirishda xatolik yuz berdi.");
    }
  };

  // Drag-to-reorder: reorders optimistically in local state as the tiles are
  // dragged, then persists the final order to the backend once the drag
  // ends. The reorder endpoint already existed in the API layer — this is
  // the UI that was missing to actually use it.
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const onTileDragStart = (imageId) => (e) => {
    setDragId(imageId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onTileDragOver = (imageId) => (e) => {
    e.preventDefault();
    if (imageId !== dragId) setDragOverId(imageId);
  };
  const onTileDrop = (imageId) => async (e) => {
    e.preventDefault();
    setDragOverId(null);
    if (!dragId || dragId === imageId) { setDragId(null); return; }
    const from = images.findIndex((img) => img.id === dragId);
    const to = images.findIndex((img) => img.id === imageId);
    if (from === -1 || to === -1) { setDragId(null); return; }
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
    setDragId(null);
    setReordering(true);
    try {
      await productApi.reorderImages(productId, next.map((img) => img.id));
    } catch {
      setError("Rasmlar tartibini saqlashda xatolik yuz berdi.");
    } finally {
      setReordering(false);
    }
  };
  const onTileDragEnd = () => { setDragId(null); setDragOverId(null); };

  const onDeleteProduct = async () => {
    setConfirmDelete(false);
    try {
      await productApi.remove(productId);
      navigate('/sotuvchi/mahsulotlar', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "Mahsulotni o'chirib bo'lmadi."));
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <div style={{ maxWidth: 560 }}>
      <h1>{isEdit ? 'Mahsulotni tahrirlash' : "Yangi mahsulot"}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {isEdit && (
        <div style={{ marginBottom: 'var(--sp-5)' }}>
          <div className="checkout-section-label">Rasmlar</div>
          {images.length > 1 && (
            <p className="image-upload-reorder-hint">
              {reordering ? 'Tartib saqlanmoqda...' : "Rasmlarni sudrab tartibini o'zgartirishingiz mumkin."}
            </p>
          )}
          <div className="image-upload-grid">
            {images.map((img) => (
              <div
                key={img.id}
                className={`image-upload-tile${dragId === img.id ? ' dragging' : ''}${dragOverId === img.id ? ' drag-over' : ''}`}
                draggable
                onDragStart={onTileDragStart(img.id)}
                onDragOver={onTileDragOver(img.id)}
                onDrop={onTileDrop(img.id)}
                onDragEnd={onTileDragEnd}
              >
                <img src={resolveImageUrl(img.image)} alt="" draggable={false} />
                <button type="button" className="image-upload-remove" onClick={() => removeImage(img.id)} aria-label="O'chirish">
                  <TrashIcon width={13} height={13} />
                </button>
                {img.is_primary && <span className="badge badge-accepted image-upload-primary-badge">Asosiy</span>}
              </div>
            ))}
            <button type="button" className="image-upload-add" onClick={onPickFile} disabled={uploading}>
              <PlusIcon width={20} height={20} />
              {uploading ? 'Yuklanmoqda...' : 'Rasm qo’shish'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
          </div>
          <p className="field-hint">Birinchi yuklangan rasm asosiy rasm sifatida belgilanadi.</p>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="category_id">Kategoriya</label>
          <select id="category_id" name="category_id" value={form.category_id} onChange={onChange} required>
            <option value="">Tanlang</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="name">Nomi</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="description">Tavsif</label>
          <textarea id="description" name="description" rows={4} value={form.description} onChange={onChange} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <div className="field">
            <label htmlFor="price">Narx (so'm)</label>
            <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} required />
          </div>
          <div className="field">
            <label htmlFor="stock">Miqdor (ixtiyoriy)</label>
            <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={onChange} placeholder="Cheksiz" />
          </div>
        </div>
        {isEdit && (
          <div className="field">
            <label htmlFor="status">Holat</label>
            <select id="status" name="status" value={form.status} onChange={onChange}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Saqlanmoqda...' : isEdit ? "O'zgarishlarni saqlash" : 'Mahsulotni yaratish'}
        </button>
      </form>

      {isEdit && (
        <VariantsEditor
          productId={productId}
          variants={variants}
          setVariants={setVariants}
          onError={setError}
        />
      )}

      {isEdit && (
        <>
          <button
            type="button"
            className="btn btn-danger-outline btn-block"
            style={{ marginTop: 'var(--sp-6)' }}
            onClick={() => setConfirmDelete(true)}
          >
            Mahsulotni o'chirish
          </button>
          <ConfirmDialog
            open={confirmDelete}
            title="Mahsulotni o'chirasizmi?"
            message="Mahsulot va uning rasmlari/variantlari butunlay o'chadi."
            confirmLabel="Ha, o'chirish"
            onConfirm={onDeleteProduct}
            onCancel={() => setConfirmDelete(false)}
          />
        </>
      )}
    </div>
  );
}


// Variants: each has a SKU, free-form attributes (rang/o'lcham/...), optional
// own price (falls back to the product price) and its own stock. When a
// product has variants, buyers must pick one, so stock lives on the variant.
const EMPTY_VARIANT = { sku: '', attrs: [{ key: '', value: '' }], price: '', stock: '', is_active: true };

function toForm(v) {
  const attrs = Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value: String(value) }));
  return {
    sku: v.sku,
    attrs: attrs.length ? attrs : [{ key: '', value: '' }],
    price: v.price ?? '',
    stock: v.stock ?? '',
    is_active: v.is_active,
  };
}

function toPayload(f) {
  const attributes = {};
  f.attrs.forEach(({ key, value }) => {
    if (key.trim() && value.trim()) attributes[key.trim()] = value.trim();
  });
  return {
    sku: f.sku.trim(),
    attributes,
    price: f.price === '' ? null : f.price,
    stock: f.stock === '' ? null : Number(f.stock),
    is_active: f.is_active,
  };
}

function VariantForm({ initial, onSave, onCancel, saving }) {
  const [f, setF] = useState(initial);
  const setAttr = (i, field, val) =>
    setF({ ...f, attrs: f.attrs.map((a, idx) => (idx === i ? { ...a, [field]: val } : a)) });

  return (
    <div className="variant-editor-row">
      <div className="variant-editor-grid">
        <input placeholder="SKU (masalan, TSH-M-QORA)" value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} />
        <input type="number" min="0" placeholder="Miqdor" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
        <input type="number" min="0" step="0.01" placeholder="Narx (bo'sh = mahsulot narxi)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Faol
        </label>
      </div>
      {f.attrs.map((a, i) => (
        <div key={i} className="variant-editor-grid">
          <input placeholder="Xususiyat (rang)" value={a.key} onChange={(e) => setAttr(i, 'key', e.target.value)} />
          <input placeholder="Qiymat (Qora)" value={a.value} onChange={(e) => setAttr(i, 'value', e.target.value)} />
        </div>
      ))}
      <div className="variant-editor-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setF({ ...f, attrs: [...f.attrs, { key: '', value: '' }] })}>
          + Xususiyat
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>Bekor</button>
        <button type="button" className="btn btn-primary btn-sm" disabled={saving || !f.sku.trim()} onClick={() => onSave(toPayload(f))}>
          {saving ? '...' : 'Saqlash'}
        </button>
      </div>
    </div>
  );
}

function VariantsEditor({ productId, variants, setVariants, onError }) {
  const [editing, setEditing] = useState(null); // variant id | 'new' | null
  const [saving, setSaving] = useState(false);

  const save = async (payload) => {
    setSaving(true);
    onError('');
    try {
      if (editing === 'new') {
        const { data } = await variantApi.create(productId, payload);
        setVariants((prev) => [...prev, data]);
      } else {
        const { data } = await variantApi.update(editing, payload);
        setVariants((prev) => prev.map((v) => (v.id === data.id ? data : v)));
      }
      setEditing(null);
    } catch (err) {
      onError(extractErrorMessage(err, 'Variantni saqlashda xatolik yuz berdi.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await variantApi.remove(id);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      onError(extractErrorMessage(err, "Variantni o'chirib bo'lmadi."));
    }
  };

  return (
    <div style={{ marginTop: 'var(--sp-6)' }}>
      <div className="checkout-section-label">Variantlar (rang, o'lcham...)</div>
      <p className="field-hint">Variant qo'shsangiz, xaridor savatga qo'shishda birini tanlashi shart bo'ladi.</p>

      {variants.map((v) =>
        editing === v.id ? (
          <VariantForm key={v.id} initial={toForm(v)} saving={saving} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <div key={v.id} className="variant-editor-row" style={{ opacity: v.is_active ? 1 : 0.55 }}>
            <strong>{variantLabel(v)}</strong>
            <span className="field-hint">
              {v.sku} · {Number(v.effective_price).toLocaleString('uz-UZ')} so'm · {v.stock != null ? `${v.stock} dona` : 'cheksiz'}
              {!v.is_active && ' · nofaol'}
            </span>
            <div className="variant-editor-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(v.id)}>Tahrirlash</button>
              <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => remove(v.id)}>
                <TrashIcon width={13} height={13} />
              </button>
            </div>
          </div>
        )
      )}

      {editing === 'new' ? (
        <VariantForm initial={EMPTY_VARIANT} saving={saving} onSave={save} onCancel={() => setEditing(null)} />
      ) : (
        <button type="button" className="btn btn-outline btn-block" onClick={() => setEditing('new')}>
          <PlusIcon width={16} height={16} /> Variant qo'shish
        </button>
      )}
    </div>
  );
}
