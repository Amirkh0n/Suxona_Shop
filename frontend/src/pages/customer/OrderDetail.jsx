import { useEffect, useState } from 'react';
import { variantLabel } from '../../utils/variants';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatSum } from '../../utils/format';
import { resolveImageUrl } from '../../utils/media';
import { extractErrorMessage } from '../../api/client';
import { PageSpinner } from '../../components/Spinner';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

export default function OrderDetail() {
  const { orderId } = useParams();
  const { myStore } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const load = () => orderApi.retrieve(orderId).then(({ data }) => setOrder(data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const isSellerOfThisOrder = myStore != null && order?.store?.id === myStore.id;

  const runAction = async (action, payload) => {
    setError('');
    setBusy(true);
    try {
      if (action === 'accept') await orderApi.accept(orderId);
      if (action === 'delivering') await orderApi.delivering(orderId);
      if (action === 'complete') await orderApi.complete(orderId);
      if (action === 'cancel') await orderApi.cancel(orderId);
      if (action === 'reject') await orderApi.reject(orderId, payload || 'Sotuvchi tomonidan rad etildi');
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Amalni bajarishda xatolik yuz berdi.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageSpinner />;

  if (!order) {
    return (
      <div>
        <PageHeader title="Buyurtma" onBack={() => navigate(-1)} />
        <div className="container page">
          <div className="empty-state card"><h3>Buyurtma topilmadi</h3></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Buyurtma #${order.id}`} onBack={() => navigate(-1)} right={<StatusBadge status={order.status} />} />

      <div className="container page">
        <p style={{ marginTop: -8 }}>{formatDate(order.created_at)}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card review-card order-detail-items">
          <div className="review-card-title">{order.store?.name}</div>
          {order.items?.map((item) => (
            <div key={item.id} className="cart-item-row">
              <div className="cart-item-media">
                {item.product?.primary_image?.image && <img src={resolveImageUrl(item.product.primary_image.image)} alt="" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cart-item-name">{item.product?.name}</div>
                {item.variant && <div className="cart-item-variant">{variantLabel(item.variant)}</div>}
                <div className="cart-item-price">{item.quantity} × {formatSum(item.price)}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{formatSum(item.subtotal)}</div>
            </div>
          ))}
          <div className="review-item-row" style={{ marginTop: 'var(--sp-3)' }}><span className="muted">Mahsulotlar</span><span>{formatSum(order.subtotal)}</span></div>
          <div className="review-item-row"><span className="muted">Yetkazib berish</span><span>{formatSum(order.delivery_price)}</span></div>
          <div className="review-item-row" style={{ fontWeight: 800, borderTop: '1px solid var(--color-line)', marginTop: 4, paddingTop: 10 }}>
            <span>Jami</span><span>{formatSum(order.total)}</span>
          </div>
        </div>

        <div className="card review-card">
          <div className="review-card-title">Yetkazib berish manzili</div>
          <p style={{ margin: 0 }}>{order.address?.village?.name}, {order.address?.street}, {order.address?.house}</p>
          {order.address?.landmark && <p style={{ margin: 0 }}>{order.address.landmark}</p>}
          {order.note && (
            <>
              <div className="review-card-title" style={{ marginTop: 'var(--sp-4)' }}>Izoh</div>
              <p style={{ margin: 0 }}>{order.note}</p>
            </>
          )}
          {!isSellerOfThisOrder && (
            <>
              <div className="review-card-title" style={{ marginTop: 'var(--sp-4)' }}>Mijoz</div>
              <p style={{ margin: 0 }}>{order.customer?.first_name} · {order.customer?.phone}</p>
            </>
          )}
        </div>

        {!isSellerOfThisOrder && order.status === 'PENDING' && (
          <button className="btn btn-danger-outline btn-block" disabled={busy} onClick={() => setConfirmCancel(true)}>
            Buyurtmani bekor qilish
          </button>
        )}

        {isSellerOfThisOrder && (
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            {order.status === 'PENDING' && (
              <>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy} onClick={() => runAction('accept')}>Qabul qilish</button>
                <button className="btn btn-danger-outline" style={{ flex: 1 }} disabled={busy} onClick={() => setRejecting((v) => !v)}>Rad etish</button>
                {rejecting && (
                  <div className="field" style={{ flexBasis: '100%', margin: 0 }}>
                    <label htmlFor="reject-reason">Rad etish sababi (mijozga yuboriladi)</label>
                    <textarea id="reject-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Masalan: mahsulot tugagan" />
                    <button
                      type="button"
                      className="btn btn-danger btn-block"
                      style={{ marginTop: 'var(--sp-2)' }}
                      disabled={busy || !reason.trim()}
                      onClick={() => runAction('reject', reason.trim())}
                    >
                      Rad etishni tasdiqlash
                    </button>
                  </div>
                )}
              </>
            )}
            {order.status === 'ACCEPTED' && (
              <button className="btn btn-primary btn-block" disabled={busy} onClick={() => runAction('delivering')}>Yetkazishga chiqarish</button>
            )}
            {order.status === 'DELIVERING' && (
              <button className="btn btn-primary btn-block" disabled={busy} onClick={() => runAction('complete')}>Yakunlash</button>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmCancel}
        title="Buyurtmani bekor qilasizmi?"
        message="Bekor qilingan buyurtmani qayta tiklab bo'lmaydi."
        confirmLabel="Ha, bekor qilish"
        onConfirm={() => { setConfirmCancel(false); runAction('cancel'); }}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
