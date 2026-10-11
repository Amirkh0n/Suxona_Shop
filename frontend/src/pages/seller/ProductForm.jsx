import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, productApi } from '../../api/endpoints';
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
    </div>
  );
}
