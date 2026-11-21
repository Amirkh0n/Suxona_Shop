import { useEffect, useState } from 'react';
import { variantLabel } from '../../utils/variants';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useNavigate, useParams } from 'react-router-dom';
import { orderApi, returnApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatSum, ORDER_STATUS_LABELS } from '../../utils/format';
import { resolveImageUrl } from '../../utils/media';
import { extractErrorMessage } from '../../api/client';
import { PageSpinner } from '../../components/Spinner';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';

function Timeline({ events }) {
  if (!events?.length) return null;
  return (
    <div className="card review-card">
      <div className="review-card-title">Buyurtma holati</div>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {events.map((ev, i) => (
          <li key={`${ev.status}-${ev.at}`} style={{ display: 'flex', gap: 10, padding: '6px 0', opacity: i === events.length - 1 ? 1 : 0.7 }}>
            <span aria-hidden style={{ color: i === events.length - 1 ? 'var(--color-primary)' : 'var(--color-muted, #8a948d)' }}>{i === events.length - 1 ? '●' : '✓'}</span>
            <span style={{ flex: 1, fontWeight: i === events.length - 1 ? 700 : 500 }}>{ORDER_STATUS_LABELS[ev.status] || ev.status}</span>
            <span className="muted" style={{ fontSize: 'var(--fs-sm)' }}>{formatDate(ev.at)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

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
  const [stars, setStars] = useState(0);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnOpen, setReturnOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [reorderMsg, setReorderMsg] = useState('');

  const load = () => orderApi.retrieve(orderId).then(({ data }) => setOrder(data));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const isSellerOfThisOrder = myStore != null && order?.store?.id === myStore.id;

  const printSlip = async () => {
    try {
      const { data } = await orderApi.printSlip(order.id);
      const w = window.open('', '_blank');
      if (!w) { setError("Oyna ochilmadi: brauzerda pop-up'ga ruxsat bering."); return; }
      w.document.write(data);
      w.document.close();
      w.focus();
      w.print();
    } catch (err) {
      setError(extractErrorMessage(err, "Varaqani ochib bo'lmadi."));
    }
  };

  const reorder = async () => {
    setBusy(true);
    setReorderMsg('');
    try {
      const { data } = await orderApi.reorder(order.id);
      if (data.added.length && !data.skipped.length) {
        navigate('/savat');
        return;
      }
      setReorderMsg(
        data.added.length
          ? `Savatga qo'shildi: ${data.added.length} ta. Mavjud emas: ${data.skipped.map((s) => s.name).join(', ')}`
          : `Hech narsa qo'shilmadi — mavjud emas: ${data.skipped.map((s) => s.name).join(', ')}`
      );
    } catch (err) {
      setError(extractErrorMessage(err, "Qayta buyurtma berib bo'lmadi."));
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (action, payload) => {
    setError('');
    setBusy(true);
    try {
      if (action === 'accept') await orderApi.accept(orderId);
      if (action === 'delivering') await orderApi.delivering(orderId, { courier_name: courierName, courier_phone: courierPhone });
      if (action === 'return') await returnApi.request(orderId, returnReason);
      if (action === 'return_approve') await returnApi.decide(orderId, true, payload || '');
      if (action === 'return_reject') await returnApi.decide(orderId, false, payload || '');
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

  const submitReview = async () => {
    setError('');
    setBusy(true);
    try {
      await orderApi.review(orderId, { rating: stars, comment });
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, 'Baho yuborilmadi.'));
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
          {Number(order.discount_amount) > 0 && (
            <div className="review-item-row"><span className="muted">Promokod {order.promo_code_text}</span><span>-{formatSum(order.discount_amount)}</span></div>
          )}
          <div className="review-item-row"><span className="muted">Yetkazib berish</span><span>{formatSum(order.delivery_price)}</span></div>
          <div className="review-item-row" style={{ fontWeight: 800, borderTop: '1px solid var(--color-line)', marginTop: 4, paddingTop: 10 }}>
            <span>Jami</span><span>{formatSum(order.total)}</span>
          </div>
        </div>

        <div className="card review-card">
          <div className="review-card-title">{order.address ? 'Yetkazib berish manzili' : "Do'kondan olib ketish"}</div>
          {order.address && (
            <>
              <p style={{ margin: 0 }}>{order.address.village?.name}, {order.address.street}, {order.address.house}</p>
              {order.address.landmark && <p style={{ margin: 0 }}>{order.address.landmark}</p>}
            </>
          )}
          {order.delivery_slot && <p style={{ margin: 0 }}>Vaqt: {order.delivery_slot}</p>}
          {order.courier_name && <p style={{ margin: 0 }}>Kuryer: {order.courier_name}{order.courier_phone ? ` · ${order.courier_phone}` : ''}</p>}
          {order.contact_phone && <p style={{ margin: 0 }}>Aloqa: {order.contact_name} · {order.contact_phone}</p>}
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

        {!isSellerOfThisOrder && order.status === 'COMPLETED' && (
          <div className="card review-card">
            <div className="review-card-title">Do'konni baholang</div>
            {order.review ? (
              <>
                <div className="star-picker">{[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ color: n <= order.review.rating ? '#f5a623' : '#c9cfca' }}>★</span>)}</div>
                {order.review.comment && <p style={{ margin: '8px 0 0' }}>{order.review.comment}</p>}
              </>
            ) : (
              <>
                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" className={n <= stars ? 'on' : ''} onClick={() => setStars(n)} aria-label={`${n} yulduz`}>★</button>
                  ))}
                </div>
                <div className="field" style={{ marginTop: 'var(--sp-3)', marginBottom: 0 }}>
                  <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Fikringiz (ixtiyoriy)" />
                </div>
                <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 'var(--sp-3)' }} disabled={busy || !stars} onClick={submitReview}>Yuborish</button>
              </>
            )}
          </div>
        )}

        <Timeline events={order.timeline} />

        {!isSellerOfThisOrder && order.courier_phone && ['ACCEPTED', 'DELIVERING'].includes(order.status) && (
          <div className="card review-card">
            <div className="review-card-title">Kuryer</div>
            <a href={`tel:${order.courier_phone}`} className="btn btn-outline btn-block">📞 {order.courier_name || 'Kuryer'} · {order.courier_phone}</a>
          </div>
        )}

        {isSellerOfThisOrder && (
          <button type="button" className="btn btn-outline btn-block" onClick={printSlip}>🖨 Chop etish (buyurtma varaqasi)</button>
        )}

        {!isSellerOfThisOrder && ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status) && (
          <>
            <button type="button" className="btn btn-outline btn-block" disabled={busy} onClick={reorder}>↻ Qayta buyurtma berish</button>
            {reorderMsg && <div className="alert">{reorderMsg}</div>}
          </>
        )}

        {order.return_request && (
          <div className="card review-card">
            <div className="review-card-title">Qaytarish so'rovi: {{ PENDING: 'ko\'rib chiqilmoqda', APPROVED: 'tasdiqlandi', REJECTED: 'rad etildi' }[order.return_request.status]}</div>
            <p style={{ margin: 0 }}>{order.return_request.reason}</p>
            {order.return_request.seller_note && <p className="muted" style={{ margin: '4px 0 0' }}>Sotuvchi: {order.return_request.seller_note}</p>}
            {isSellerOfThisOrder && order.return_request.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--sp-3)' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy} onClick={() => runAction('return_approve')}>Tasdiqlash</button>
                <button className="btn btn-outline" style={{ flex: 1 }} disabled={busy} onClick={() => runAction('return_reject', 'Qaytarish mumkin emas')}>Rad etish</button>
              </div>
            )}
          </div>
        )}

        {!isSellerOfThisOrder && order.status === 'COMPLETED' && !order.return_request && (
          <div className="card review-card">
            {returnOpen ? (
              <>
                <div className="review-card-title">Qaytarish sababi</div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <textarea rows={3} value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="Nima sababdan qaytarmoqchisiz?" />
                </div>
                <button className="btn btn-primary btn-block" style={{ marginTop: 'var(--sp-3)' }} disabled={busy || !returnReason.trim()} onClick={() => runAction('return')}>Yuborish</button>
              </>
            ) : (
              <button type="button" className="btn btn-outline btn-block" onClick={() => setReturnOpen(true)}>Mahsulotni qaytarish (7 kun ichida)</button>
            )}
          </div>
        )}

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
              <>
                {order.delivery_method !== 'PICKUP' && (
                  <div style={{ display: 'flex', gap: 8, flexBasis: '100%' }}>
                    <input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Kuryer ismi (ixtiyoriy)" />
                    <input type="tel" value={courierPhone} onChange={(e) => setCourierPhone(e.target.value)} placeholder="Kuryer telefoni" />
                  </div>
                )}
                <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy} onClick={() => runAction('delivering')}>Yetkazishga chiqarish</button>
                <button className="btn btn-danger-outline" style={{ flex: 1 }} disabled={busy} onClick={() => setConfirmCancel(true)}>Bekor qilish</button>
              </>
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
