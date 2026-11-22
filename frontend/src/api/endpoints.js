import api from './client';

/* ---------- Auth ---------- */
export const authApi = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (payload) => api.post('/auth/register', payload),
  refresh: (refresh) => api.post('/auth/refresh', { refresh }),
  logout: (refresh) => api.post('/auth/logout', { refresh }),
  me: () => api.get('/auth/me'),
  passwordResetRequest: (phone) => api.post('/auth/password-reset', { phone }),
  passwordResetConfirm: (payload) => api.post('/auth/password-reset/confirm', payload),
  telegramVerify: (payload) => api.post('/auth/telegram/verify', payload),
};

/* ---------- Villages ---------- */
export const villageApi = {
  list: (page) => api.get('/villages', { params: { page } }),
};

/* ---------- Addresses ---------- */
export const addressApi = {
  list: () => api.get('/addresses'),
  create: (payload) => api.post('/addresses', payload),
  retrieve: (id) => api.get(`/addresses/${id}`),
  update: (id, payload) => api.patch(`/addresses/${id}`, payload),
  remove: (id) => api.delete(`/addresses/${id}`),
};

/* ---------- Banners ---------- */
export const bannerApi = {
  list: () => api.get('/banners/'),
};

/* ---------- Categories ---------- */
export const categoryApi = {
  list: (page) => api.get('/categories', { params: { page } }),
  retrieve: (id) => api.get(`/categories/${id}`),
};

/* ---------- Stores ---------- */
export const storeApi = {
  list: (params) => api.get('/stores', { params }),
  retrieve: (id) => api.get(`/stores/${id}`),
  reviews: (storeId, params) => api.get(`/stores/${storeId}/reviews`, { params }),
  deliveryZones: (storeId) => api.get(`/stores/${storeId}/delivery-zones`),
  myStore: () => api.get('/stores/my'),
  updateMyStore: (payload) => api.patch('/stores/my', payload),
  // Separate call because logo/banner are multipart file fields
  // (PatchedStoreUpdate), unlike the plain-JSON profile fields above.
  updateMyStoreMedia: (formData) =>
    api.patch('/stores/my', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

/* ---------- Store applications ---------- */
export const storeApplicationApi = {
  apply: (payload) => api.post('/store-applications', payload),
};

/* ---------- Products ---------- */
export const productApi = {
  list: (params) => api.get('/products', { params }),
  retrieve: (id) => api.get(`/products/${id}`),
  similar: (id) => api.get(`/products/${id}/similar`),
  reviews: (id, params) => api.get(`/products/${id}/reviews`, { params }),
  addReview: (id, payload) => api.post(`/products/${id}/reviews`, payload),
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.patch(`/products/${id}`, payload),
  remove: (id) => api.delete(`/products/${id}`),
  myProducts: (params) => api.get('/products/my', { params }),
  exportCsv: () => api.get('/products/my/export', { responseType: 'blob' }),
  importCsv: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/products/my/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  stockAlertIds: () => api.get('/products/stock-alerts'),
  watchStock: (id) => api.put(`/products/${id}/notify-stock`),
  unwatchStock: (id) => api.delete(`/products/${id}/notify-stock`),
  uploadImage: (productId, formData) =>
    api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  reorderImages: (productId, imageIds) =>
    api.post(`/products/${productId}/images/reorder`, { images: imageIds }),
  deleteImage: (imageId) => api.delete(`/product-images/${imageId}`),
};

/* ---------- Product variants (seller) ---------- */
export const variantApi = {
  create: (productId, payload) => api.post(`/products/${productId}/variants`, payload),
  update: (variantId, payload) => api.patch(`/product-variants/${variantId}`, payload),
  remove: (variantId) => api.delete(`/product-variants/${variantId}`),
};

/* ---------- Notifications, promo, returns, stats ---------- */
export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  readAll: () => api.post('/notifications/read-all'),
  read: (id) => api.post(`/notifications/${id}/read`),
};

export const sellerReviewApi = {
  list: () => api.get('/reviews/my'),
  reply: (kind, id, reply) =>
    api.post(`/${kind === 'store' ? 'store-reviews' : 'product-reviews'}/${id}/reply`, { reply }),
  removeReply: (kind, id) =>
    api.delete(`/${kind === 'store' ? 'store-reviews' : 'product-reviews'}/${id}/reply`),
};

export const sellerPromoApi = {
  list: () => api.get('/stores/my/promo-codes'),
  create: (payload) => api.post('/stores/my/promo-codes', payload),
  update: (id, payload) => api.patch(`/stores/my/promo-codes/${id}`, payload),
  remove: (id) => api.delete(`/stores/my/promo-codes/${id}`),
};

export const promoApi = {
  check: (storeId, code) => api.post('/promo/check', { store_id: storeId, code }),
};

export const returnApi = {
  request: (orderId, reason) => api.post(`/orders/${orderId}/return`, { reason }),
  decide: (orderId, approve, note) => api.post(`/orders/${orderId}/return/decide`, { approve, note }),
};

export const statsApi = {
  seller: (days = 30) => api.get('/orders/store/stats', { params: { days } }),
};

/* ---------- Favorites ---------- */
export const favoriteApi = {
  list: (params) => api.get('/favorites', { params }),
  ids: () => api.get('/favorites/ids'),
  add: (productId) => api.put(`/products/${productId}/favorite`),
  remove: (productId) => api.delete(`/products/${productId}/favorite`),
};

/* ---------- Cart ---------- */
export const cartApi = {
  get: () => api.get('/cart'),
  clear: () => api.delete('/cart'),
  addItem: (productId, quantity, variantId = null) =>
    api.post('/cart/items', {
      product_id: productId,
      quantity,
      ...(variantId ? { variant_id: variantId } : {}),
    }),
  updateItem: (itemId, quantity) => api.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
};

/* ---------- Delivery zones (seller) ---------- */
export const deliveryZoneApi = {
  create: (payload) => api.post('/delivery-zones', payload),
  update: (id, payload) => api.patch(`/delivery-zones/${id}`, payload),
  remove: (id) => api.delete(`/delivery-zones/${id}`),
};

/* ---------- Orders ---------- */
export const orderApi = {
  // idempotencyKey makes the call safe to retry (double click, flaky network):
  // the backend returns the original order instead of creating a second one.
  // payload: { store_id, delivery_method, address_id?, contact_name?, contact_phone?, note? }
  create: (payload, idempotencyKey) =>
    api.post(
      '/orders',
      payload,
      idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined
    ),
  review: (id, payload) => api.post(`/orders/${id}/review`, payload),
  retrieve: (id) => api.get(`/orders/${id}`),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
  printSlip: (id) => api.get(`/orders/${id}/print`, { responseType: 'text' }),
  exportCsv: (days = 30) => api.get('/orders/store/export', { params: { days }, responseType: 'blob' }),
  my: (params) => api.get('/orders/my', { params }),
  storeOrders: (params) => api.get('/orders/store', { params }),
  accept: (id) => api.post(`/orders/${id}/accept`),
  reject: (id, reason) => api.post(`/orders/${id}/reject`, { reason }),
  delivering: (id, courier) => api.post(`/orders/${id}/delivering`, courier || {}),
  complete: (id) => api.post(`/orders/${id}/complete`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
};

/* ---------- Telegram ---------- */
export const telegramApi = {
  link: (payload) => api.post('/telegram/link', payload),
  me: () => api.get('/telegram/me'),
};
