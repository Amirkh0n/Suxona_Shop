import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/endpoints';
import { formatDate, formatSum } from '../../utils/format';
import { RowSkeleton } from '../../components/Skeleton';
import StatusBadge from '../../components/StatusBadge';

const TABS = [
  { value: '', label: 'Barchasi' },
  { value: 'PENDING', label: 'Yangi' },
  { value: 'ACCEPTED', label: 'Qabul qilindi' },
  { value: 'DELIVERING', label: "Yo'lda" },
  { value: 'COMPLETED', label: 'Yakunlangan' },
];

export default function SellerOrders() {
  const [tab, setTab] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    orderApi
      .storeOrders({ page: 1, status: tab || undefined })
      .then(({ data }) => setOrders(data?.results || []))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <h1>Buyurtmalar</h1>

      <div className="segmented-tabs">
        {TABS.map((t) => (
          <button key={t.value} type="button" className={`segmented-tab${tab === t.value ? ' active' : ''}`} onClick={() => setTab(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <RowSkeleton count={5} />
      ) : orders.length === 0 ? (
        <div className="empty-state card"><h3>Bu bo'limda buyurtma yo'q</h3></div>
      ) : (
        orders.map((order) => (
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
