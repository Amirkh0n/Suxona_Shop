import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, productApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatSum, isSameDay } from '../../utils/format';
import { PageSpinner } from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

export default function SellerDashboard() {
  const { myStore } = useAuth();
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderApi.storeOrders({ page: 1 }).catch(() => ({ data: { results: [] } })),
      productApi.myProducts({ page: 1 }).catch(() => ({ data: { results: [], count: 0 } })),
    ]).then(([ordersRes, productsRes]) => {
      setOrders(ordersRes.data?.results || []);
      setProductCount(productsRes.data?.count ?? (productsRes.data?.results || []).length);
    }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const today = orders.filter((o) => isSameDay(o.created_at));
    const pending = orders.filter((o) => o.status === 'PENDING');
    const completedTotal = orders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    return {
      todayCount: today.length,
      todaySales: today.reduce((sum, o) => sum + Number(o.total || 0), 0),
      pendingCount: pending.length,
      totalSales: completedTotal,
    };
  }, [orders]);

  if (loading) return <PageSpinner />;

  return (
    <div>
      <h1>Bosh sahifa</h1>
      <p style={{ marginBottom: 'var(--sp-5)' }}>{myStore?.name}</p>

      <div className="stat-grid">
        <div className="card stat-tile">
          <div className="stat-tile-label">Bugungi buyurtmalar</div>
          <div className="stat-tile-value">{stats.todayCount}</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-tile-label">Bugungi savdo</div>
          <div className="stat-tile-value">{formatSum(stats.todaySales)}</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-tile-label">Kutilayotgan</div>
          <div className="stat-tile-value">{stats.pendingCount}</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-tile-label">Jami savdo</div>
          <div className="stat-tile-value">{formatSum(stats.totalSales)}</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-tile-label">Mahsulotlar</div>
          <div className="stat-tile-value">{productCount}</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-tile-label">Jami buyurtmalar</div>
          <div className="stat-tile-value">{orders.length}</div>
        </div>
      </div>

      <div className="section-heading">
        <h2>Yangi buyurtmalar</h2>
        <Link to="/sotuvchi/buyurtmalar" className="section-heading-link">Barchasi</Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state card"><h3>Hali buyurtma yo'q</h3></div>
      ) : (
        orders.slice(0, 6).map((order) => (
          <Link key={order.id} to={`/buyurtma/${order.id}`} className="card order-list-item">
            <div className="order-list-info">
              <div className="order-list-id">#{order.id}</div>
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
