import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addressApi, orderApi, productApi, storeApi, villageApi } from '../../api/endpoints';
import { useCart } from '../../context/CartContext';
import { extractErrorMessage } from '../../api/client';
import { formatSum } from '../../utils/format';
import { PageSpinner } from '../../components/Spinner';
import PageHeader from '../../components/PageHeader';
import { PinIcon } from '../../components/Icons';

export default function Checkout() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { cart, refresh: refreshCart } = useCart();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [villages, setVillages] = useState([]);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      addressApi.list(),
      villageApi.list().catch(() => ({ data: { results: [] } })),
      storeApi.deliveryZones(storeId).catch(() => ({ data: [] })),
    ])
      .then(([addrRes, villageRes, zonesRes]) => {
        const list = addrRes.data?.results || addrRes.data || [];
        setAddresses(list);
        setVillages(villageRes.data?.results || []);
        setDeliveryZones(zonesRes.data || []);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setAddressId(String(def.id));
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  const villageName = (villageId) => villages.find((v) => v.id === villageId)?.name || '';
  const selectedAddress = addresses.find((a) => String(a.id) === addressId);
  const matchedZone = selectedAddress
    ? deliveryZones.find((z) => z.village?.id === selectedAddress.village && z.is_active)
    : null;

  const group = (cart?.stores || []).find((g) => String(g.store_id) === String(storeId));
  const items = group?.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);
  const deliveryEstimate = matchedZone ? Number(matchedZone.delivery_price) : null;
  const totalEstimate = deliveryEstimate != null ? subtotal + deliveryEstimate : null;

  // The cart was fetched when the shopper first added items, possibly
  // minutes or hours before checkout — another buyer could have taken the
  // last units in the meantime. Re-checking stock right before the order is
  // submitted (rather than only discovering it from a backend rejection)
  // lets us tell the shopper exactly which item is the problem.
  const revalidateStock = async () => {
    setCheckingStock(true);
    try {
      const fresh = await Promise.all(items.map((item) => productApi.retrieve(item.product.id)));
      const problems = [];
      fresh.forEach(({ data: product }, idx) => {
        const item = items[idx];
        const outOfStock = product.status === 'OUT_OF_STOCK';
        const insufficient = product.stock != null && product.stock < item.quantity;
        if (outOfStock) problems.push(`"${product.name}" sotuvda yo'q.`);
        else if (insufficient) problems.push(`"${product.name}" omborda faqat ${product.stock} dona qoldi (savatda ${item.quantity} dona).`);
      });
      if (problems.length > 0) {
        setError(`Ba'zi mahsulotlar mavjud emas: ${problems.join(' ')} Iltimos, savatni yangilang.`);
        return false;
      }
      return true;
    } catch {
      // Network hiccup on the check itself shouldn't block checkout — the
      // backend still validates stock when the order is actually created.
      return true;
    } finally {
      setCheckingStock(false);
    }
  };

  const goReview = async () => {
    setError('');
    if (!addressId) { setError('Iltimos, yetkazib berish manzilini tanlang.'); return; }
    const ok = await revalidateStock();
    if (!ok) return;
    setStep(2);
  };

  const submitOrder = async () => {
    setError('');
    const ok = await revalidateStock();
    if (!ok) return;
    setSubmitting(true);
    try {
      const { data } = await orderApi.create(Number(storeId), Number(addressId), note || undefined);
      await refreshCart();
      navigate(`/buyurtma-qabul-qilindi/${data.id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Buyurtma berishda xatolik yuz berdi.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (addresses.length === 0) {
    return (
      <div>
        <PageHeader title="Buyurtma berish" onBack={() => navigate(-1)} />
        <div className="container page">
          <div className="empty-state card">
            <h3>Sizda saqlangan manzil yo'q</h3>
            <p>Buyurtma berishdan oldin manzil qo'shing.</p>
            <button className="btn btn-primary" onClick={() => navigate('/profil/manzillar')}>Manzil qo'shish</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Buyurtma berish"
        step={`${step}/2-qadam`}
        onBack={() => (step === 2 ? setStep(1) : navigate(-1))}
      />

      {step === 1 ? (
        <div className="container checkout-step">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="checkout-section-label">Manzil</div>
          {addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              className={`option-card${addressId === String(addr.id) ? ' active' : ''}`}
              onClick={() => setAddressId(String(addr.id))}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <span className="option-card-radio" />
              <span className="option-card-body">
                <span className="option-card-title">{addr.street}, {addr.house}</span>
                <span className="option-card-sub">
                  <PinIcon width={12} height={12} style={{ verticalAlign: '-1px', marginRight: 3 }} />
                  {villageName(addr.village)}{addr.landmark ? ` · ${addr.landmark}` : ''}
                </span>
              </span>
            </button>
          ))}
          <button type="button" className="btn btn-outline btn-block" style={{ marginBottom: 'var(--sp-5)' }} onClick={() => navigate('/profil/manzillar')}>
            + Yangi manzil qo'shish
          </button>

          <div className="checkout-section-label">Yetkazib berish narxi</div>
          <div className="option-card active" style={{ cursor: 'default' }}>
            <span className="option-card-radio" />
            <span className="option-card-body">
              <span className="option-card-title">Eshikkacha yetkazib berish</span>
              <span className="option-card-sub">
                {matchedZone
                  ? `${formatSum(matchedZone.delivery_price)} · tanlangan manzil bo'yicha`
                  : "Tasdiqlashda hisoblanadi (bu manzil uchun narx hali belgilanmagan bo'lishi mumkin)"}
              </span>
            </span>
          </div>

          <div className="field" style={{ marginTop: 'var(--sp-5)' }}>
            <label htmlFor="note">Izoh (ixtiyoriy)</label>
            <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Kuryerga izoh, masalan: darvoza rangi..." />
          </div>
        </div>
      ) : (
        <div className="container checkout-step">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="card review-card">
            <div className="review-card-title">{group?.store_name}</div>
            {items.map((item) => (
              <div key={item.id} className="review-item-row">
                <span className="muted">{item.product?.name} × {item.quantity}</span>
                <span>{formatSum(Number(item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="card review-card">
            <div className="review-card-title">Yetkazib berish manzili</div>
            <p style={{ margin: 0 }}>{selectedAddress?.street}, {selectedAddress?.house}</p>
            <p style={{ margin: 0 }}>{villageName(selectedAddress?.village)}{selectedAddress?.landmark ? ` · ${selectedAddress.landmark}` : ''}</p>
            {note && (
              <>
                <div className="review-card-title" style={{ marginTop: 'var(--sp-4)' }}>Izoh</div>
                <p style={{ margin: 0 }}>{note}</p>
              </>
            )}
          </div>

          <div className="card review-card">
            <div className="review-item-row"><span className="muted">Mahsulotlar summasi</span><span>{formatSum(subtotal)}</span></div>
            <div className="review-item-row">
              <span className="muted">Yetkazib berish</span>
              <span>{deliveryEstimate != null ? formatSum(deliveryEstimate) : 'Tasdiqlashda'}</span>
            </div>
            <div className="review-item-row" style={{ fontWeight: 800, fontSize: 'var(--fs-md)', borderTop: '1px solid var(--color-line)', marginTop: 6, paddingTop: 10 }}>
              <span>Jami</span>
              <span>{totalEstimate != null ? formatSum(totalEstimate) : formatSum(subtotal) + '+'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="checkout-footer">
        <div className="container">
          {step === 1 ? (
            <button type="button" className="btn btn-primary btn-block" onClick={goReview} disabled={items.length === 0 || checkingStock}>
              {checkingStock ? 'Tekshirilmoqda...' : 'Davom etish'}
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-block" onClick={submitOrder} disabled={submitting || checkingStock}>
              {submitting ? 'Yuborilmoqda...' : checkingStock ? 'Tekshirilmoqda...' : 'Buyurtmani tasdiqlash'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
