import { useEffect, useRef, useState } from 'react';
import { deliveryZoneApi, storeApi, villageApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../api/client';
import { formatSum } from '../../utils/format';
import { resolveImageUrl } from '../../utils/media';
import { PageSpinner } from '../../components/Spinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { TrashIcon, PlusIcon } from '../../components/Icons';

export default function SellerSettings() {
  const { myStore, refreshMyStore } = useAuth();
  const [form, setForm] = useState({ name: '', description: '', phone: '', telegram_username: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const [villages, setVillages] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneForm, setZoneForm] = useState({ village_id: '', delivery_price: '' });
  const [zoneSaving, setZoneSaving] = useState(false);
  const [zoneError, setZoneError] = useState('');
  const [loadingZones, setLoadingZones] = useState(true);
  const [confirmZoneId, setConfirmZoneId] = useState(null);

  useEffect(() => {
    if (myStore) {
      setForm({
        name: myStore.name || '',
        description: myStore.description || '',
        phone: myStore.phone || '',
        telegram_username: myStore.telegram_username || '',
      });
    }
  }, [myStore]);

  const loadZones = () => {
    if (!myStore) return;
    setLoadingZones(true);
    Promise.all([
      villageApi.list().catch(() => ({ data: { results: [] } })),
      storeApi.deliveryZones(myStore.id).catch(() => ({ data: [] })),
    ]).then(([vRes, zRes]) => {
      setVillages(vRes.data?.results || []);
      setZones(zRes.data || []);
    }).finally(() => setLoadingZones(false));
  };

  useEffect(loadZones, [myStore]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pickLogo = () => logoInputRef.current?.click();
  const pickBanner = () => bannerInputRef.current?.click();

  const onLogoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMediaError('');
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      await storeApi.updateMyStoreMedia(fd);
      await refreshMyStore();
    } catch (err) {
      setMediaError(extractErrorMessage(err, 'Logotipni yuklashda xatolik yuz berdi.'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const onBannerChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMediaError('');
    setUploadingBanner(true);
    try {
      const fd = new FormData();
      fd.append('banner', file);
      await storeApi.updateMyStoreMedia(fd);
      await refreshMyStore();
    } catch (err) {
      setMediaError(extractErrorMessage(err, 'Banner rasmini yuklashda xatolik yuz berdi.'));
    } finally {
      setUploadingBanner(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await storeApi.updateMyStore(form);
      await refreshMyStore();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(extractErrorMessage(err, 'Saqlashda xatolik yuz berdi.'));
    } finally {
      setSaving(false);
    }
  };

  const onZoneChange = (e) => setZoneForm({ ...zoneForm, [e.target.name]: e.target.value });

  const addZone = async (e) => {
    e.preventDefault();
    setZoneError('');
    setZoneSaving(true);
    try {
      await deliveryZoneApi.create({ village_id: Number(zoneForm.village_id), delivery_price: zoneForm.delivery_price });
      setZoneForm({ village_id: '', delivery_price: '' });
      loadZones();
    } catch (err) {
      setZoneError(extractErrorMessage(err, "Zonani qo'shishda xatolik yuz berdi."));
    } finally {
      setZoneSaving(false);
    }
  };

  const removeZone = async (id) => {
    await deliveryZoneApi.remove(id);
    loadZones();
  };

  const confirmRemoveZone = async () => {
    const id = confirmZoneId;
    setConfirmZoneId(null);
    if (id) await removeZone(id);
  };

  const usedVillageIds = new Set(zones.map((z) => z.village?.id));
  const availableVillages = villages.filter((v) => !usedVillageIds.has(v.id));

  return (
    <div style={{ maxWidth: 560 }}>
      <h1>Do'kon sozlamalari</h1>

      {mediaError && <div className="alert alert-error">{mediaError}</div>}

      <div className="store-media-upload">
        <button type="button" className="store-banner-upload" onClick={pickBanner} disabled={uploadingBanner} aria-label="Banner yuklash">
          {myStore?.banner ? (
            <img src={resolveImageUrl(myStore.banner)} alt="Do'kon banneri" />
          ) : (
            <span className="store-banner-upload-hint">
              <PlusIcon width={20} height={20} />
              {uploadingBanner ? 'Yuklanmoqda...' : "Banner rasmi qo'shish"}
            </span>
          )}
          {myStore?.banner && <span className="store-banner-upload-overlay">{uploadingBanner ? 'Yuklanmoqda...' : "O'zgartirish"}</span>}
        </button>
        <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={onBannerChange} />

        <div className="store-logo-row">
          <button type="button" className="store-logo-upload" onClick={pickLogo} disabled={uploadingLogo} aria-label="Logotip yuklash">
            {myStore?.logo ? <img src={resolveImageUrl(myStore.logo)} alt="Do'kon logotipi" /> : (myStore?.name?.[0]?.toUpperCase() || 'D')}
            <span className="store-logo-upload-overlay"><PlusIcon width={16} height={16} /></span>
          </button>
          <div>
            <div className="store-logo-row-label">Do'kon logotipi</div>
            <div className="store-logo-row-hint">{uploadingLogo ? 'Yuklanmoqda...' : 'Kvadrat shaklidagi rasm tavsiya etiladi'}</div>
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={onLogoChange} />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {saved && <div className="alert alert-info">Saqlandi.</div>}

      <form onSubmit={onSubmit} className="card" style={{ padding: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
        <div className="field">
          <label htmlFor="name">Do'kon nomi</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required />
        </div>
        <div className="field">
          <label htmlFor="description">Tavsif</label>
          <textarea id="description" name="description" rows={3} value={form.description} onChange={onChange} />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefon</label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} />
        </div>
        <div className="field">
          <label htmlFor="telegram_username">Telegram username</label>
          <input id="telegram_username" name="telegram_username" value={form.telegram_username} onChange={onChange} placeholder="@dokonim" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </form>

      <h2>Yetkazib berish zonalari</h2>
      <p>Har bir qishloq/mahalla uchun yetkazib berish narxini belgilang.</p>

      {loadingZones ? (
        <PageSpinner />
      ) : (
        <>
          {zones.map((zone) => (
            <div key={zone.id} className="card" style={{ padding: 'var(--sp-4)', marginBottom: 'var(--sp-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{zone.village?.name}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-ink-soft)' }}>{zone.village?.district}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <span style={{ fontWeight: 700 }}>{formatSum(zone.delivery_price)}</span>
                <button type="button" className="btn btn-icon btn-danger-outline" onClick={() => setConfirmZoneId(zone.id)} aria-label="O'chirish">
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </div>
          ))}

          {availableVillages.length > 0 ? (
            <form onSubmit={addZone} className="card" style={{ padding: 'var(--sp-4)', marginTop: 'var(--sp-3)' }}>
              {zoneError && <div className="alert alert-error">{zoneError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: 'var(--sp-3)', alignItems: 'end' }}>
                <div className="field" style={{ margin: 0 }}>
                  <label htmlFor="village_id">Qishloq</label>
                  <select id="village_id" name="village_id" value={zoneForm.village_id} onChange={onZoneChange} required>
                    <option value="">Tanlang</option>
                    {availableVillages.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label htmlFor="delivery_price">Narx</label>
                  <input id="delivery_price" name="delivery_price" type="number" min="0" step="0.01" value={zoneForm.delivery_price} onChange={onZoneChange} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={zoneSaving}>Qo'shish</button>
              </div>
            </form>
          ) : zones.length === 0 ? (
            <div className="empty-state card"><h3>Hali yetkazib berish zonasi yo'q</h3></div>
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={confirmZoneId != null}
        title="Zonani o'chirish"
        message="Bu yetkazib berish zonasini o'chirishni tasdiqlaysizmi?"
        confirmLabel="O'chirish"
        onConfirm={confirmRemoveZone}
        onCancel={() => setConfirmZoneId(null)}
      />
    </div>
  );
}
