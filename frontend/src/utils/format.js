export function formatSum(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return `${n.toLocaleString('uz-UZ', { maximumFractionDigits: 0 })} so'm`;
}

export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(isoString, reference = new Date()) {
  if (!isoString) return false;
  const d = new Date(isoString);
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
}

export const ORDER_STATUS_LABELS = {
  PENDING: 'Kutilmoqda',
  ACCEPTED: 'Qabul qilindi',
  DELIVERING: "Yo'lda",
  COMPLETED: 'Yetkazildi',
  CANCELLED: 'Bekor qilindi',
  REJECTED: 'Rad etildi',
};

export const ORDER_STATUS_CLASS = {
  PENDING: 'badge-pending',
  ACCEPTED: 'badge-accepted',
  DELIVERING: 'badge-delivering',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
  REJECTED: 'badge-rejected',
};

export const PRODUCT_STATUS_LABELS = {
  DRAFT: 'Qoralama',
  PENDING_REVIEW: 'Moderatsiyada',
  REJECTED: 'Rad etilgan',
  ACTIVE: 'Faol',
  OUT_OF_STOCK: 'Tugagan',
  HIDDEN: 'Yashirilgan',
};

export const STORE_STATUS_LABELS = {
  PENDING: "Ko'rib chiqilmoqda",
  ACTIVE: 'Faol',
  SUSPENDED: "To'xtatilgan",
  REJECTED: 'Rad etilgan',
};
