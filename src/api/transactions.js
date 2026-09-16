import { apiClient } from "./client.js";

export async function getTransactions(params = {}) {
  const response = await apiClient.get("/transactions", { params });
  return { items: response.data.data, meta: response.data.meta };
}

// Ke resolver membaca foto transaksi dari multipart field "photos".
const PHOTO_FIELD = "photos";

// Konversi payload transaksi biasa + daftar file foto menjadi FormData agar
// dikirim dengan Content-Type multipart/form-data.
function transactionFormData(payload) {
  const formData = new FormData();
  formData.append("wallet_id", String(payload.wallet_id));
  formData.append("category_id", String(payload.category_id));
  formData.append("amount", String(payload.amount));
  formData.append("type", payload.type);
  formData.append("date", payload.date);
  if (payload.description) formData.append("description", payload.description);
  for (const file of payload.photos || []) {
    formData.append(PHOTO_FIELD, file);
  }
  return formData;
}

function stripUploadMeta(payload) {
  const body = { ...payload };
  delete body.photos;
  delete body.remove_photos;
  return body;
}

export async function createTransaction(payload) {
  const hasPhotos = Boolean(payload.photos?.length);
  const body = hasPhotos ? transactionFormData(payload) : stripUploadMeta(payload);
  const response = await apiClient.post("/transactions", body);
  return response.data.data;
}

export async function updateTransaction(id, payload) {
  // Hapus foto bukti yang dipilih pengguna untuk dihapus.
  for (const photoId of payload.remove_photos || []) {
    await deleteTransactionPhoto(id, photoId);
  }
  const hasPhotos = Boolean(payload.photos?.length);
  const body = hasPhotos ? transactionFormData(payload) : stripUploadMeta(payload);
  const response = await apiClient.put(`/transactions/${id}`, body);
  return response.data.data;
}

export async function deleteTransactionPhoto(transactionId, photoId) {
  await apiClient.delete(`/transactions/${transactionId}/photos/${photoId}`);
}

export async function voidTransaction(id) {
  await apiClient.delete(`/transactions/${id}`);
}

export async function restoreTransaction(id) {
  const response = await apiClient.post(`/transactions/${id}/restore`);
  return response.data.data;
}