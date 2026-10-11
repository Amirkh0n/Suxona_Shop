import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/endpoints';
import { formatDate, formatSum } from '../../utils/format';
import { RowSkeleton } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';

const TABS = [
  { value: '', label: 'Barchasi' },
  { value: 'PENDING', label: 'Kutilmoqda' },
  { value: 'ACCEPTED', label: 'Qabul qilindi' },
  { value: 'DELIVERING', label: "Yo'lda" },
  { value: 'COMPLETED', label: 'Yetkazildi' },
];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');

  useEffect(() => {
    orderApi.my().then(({ data }) => setOrders(data?.results || [])).finally(() => setLoading(false));
  }, []);

  const filtered = tab ? orders.filter((o) => o.status === tab) : orders;

  if (loading) {
    return (
      <div className="container page">
        <h1>Buyurtmalarim</h1>
        <RowSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Buyurtmalarim</h1>

      {orders.length > 0 && (
        <div className="segmented-tabs">
          {TABS.map((t) => (
            <button key={t.value} type="button" className={`segmented-tab${tab === t.value ? ' active' : ''}`} onClick={() => setTab(t.value)}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state card">
          <h3>Hali buyurtma yo'q</h3>
          <p>Mahsulotlarni ko'rib chiqing va birinchi buyurtmangizni bering.</p>
          <Link to="/mahsulotlar" className="btn btn-primary">Xaridni boshlash</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card"><h3>Bu bo'limda buyurtma yo'q</h3></div>
      ) : (
        filtered.map((order) => (
          <Link key={order.id} to={`/buyurtma/${order.id}`} className="card order-list-item">
            <div className="order-list-info">
              <div className="order-list-id">Buyurtma #{order.id}</div>
              <div className="order-list-date">{formatDate(order.created_at)}</div>
            </div>
            <div className="order-list-right">
              <div className="order-list-total">{formatSum(order.total)}</div>
              <StatusBadge status={order.status} />
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
