import { useI18n } from '../i18n';
import { ORDER_STATUS_CLASS } from '../utils/format';

export default function StatusBadge({ status }) {
  const { t } = useI18n();
  const label = t(`status.${status}`);
  return <span className={`badge ${ORDER_STATUS_CLASS[status] || ''}`}>{label === `status.${status}` ? status : label}</span>;
}
