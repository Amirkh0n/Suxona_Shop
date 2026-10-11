import { ORDER_STATUS_CLASS, ORDER_STATUS_LABELS } from '../utils/format';

export default function StatusBadge({ status }) {
  return <span className={`badge ${ORDER_STATUS_CLASS[status] || ''}`}>{ORDER_STATUS_LABELS[status] || status}</span>;
}
