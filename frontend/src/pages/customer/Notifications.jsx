import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/endpoints';
import { useNotifications } from '../../context/NotificationsContext';
import PageHeader from '../../components/PageHeader';
import { useI18n } from '../../i18n';

export default function Notifications() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { refresh } = useNotifications();
  const [items, setItems] = useState(null);

  useEffect(() => {
    notificationApi.list().then(({ data }) => setItems(data.results || [])).catch(() => setItems([]));
  }, []);

  const open = async (n) => {
    if (!n.is_read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
      notificationApi.read(n.id).then(refresh).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const readAll = async () => {
    await notificationApi.readAll().catch(() => {});
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    refresh();
  };

  return (
    <div className="page">
      <PageHeader title={t('notif.title')} right={items?.some((n) => !n.is_read) ? <button type="button" className="btn btn-sm btn-outline" onClick={readAll}>✓</button> : null} />
      <div className="container">
        {items === null ? null : items.length === 0 ? (
          <div className="empty-state card"><h3>{t('notif.empty')}</h3></div>
        ) : (
          items.map((n) => (
            <button key={n.id} type="button" className={`card notif-item${n.is_read ? '' : ' unread'}`} onClick={() => open(n)}>
              <strong>{n.title}</strong>
              {n.body && <span className="muted">{n.body}</span>}
              <span className="muted" style={{ fontSize: 12 }}>{new Date(n.created_at).toLocaleString()}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
