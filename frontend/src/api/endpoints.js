import api from './client';

/* ---------- Auth ---------- */
export const authApi = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  register: (payload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
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
  create: (payload) => api.post('/products', payload),
  update: (id, payload) => api.patch(`/products/${id}`, payload),
  myProducts: (params) => api.get('/products/my', { params }),
  uploadImage: (productId, formData) =>
    api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  reorderImages: (productId, imageIds) =>
    api.post(`/products/${productId}/images/reorder`, { images: imageIds }),
  deleteImage: (imageId) => api.delete(`/product-images/${imageId}`),
};

/* ---------- Cart ---------- */
export const cartApi = {
  get: () => api.get('/cart'),
  clear: () => api.delete('/cart'),
  addItem: (productId, quantity) => api.post('/cart/items', { product_id: productId, quantity }),
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
  create: (storeId, addressId, note) =>
    api.post('/orders', { store_id: storeId, address_id: addressId, note }),
  retrieve: (id) => api.get(`/orders/${id}`),
  my: (params) => api.get('/orders/my', { params }),
  storeOrders: (params) => api.get('/orders/store', { params }),
  accept: (id) => api.post(`/orders/${id}/accept`),
  reject: (id, reason) => api.post(`/orders/${id}/reject`, { reason }),
  delivering: (id) => api.post(`/orders/${id}/delivering`),
  complete: (id) => api.post(`/orders/${id}/complete`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
};

/* ---------- Telegram ---------- */
export const telegramApi = {
  link: (payload) => api.post('/telegram/link', payload),
  me: () => api.get('/telegram/me'),
};
