import { apiClient } from "./client.js";

export async function getTransactions(params = {}) {
  const response = await apiClient.get("/transactions", { params });
  return { items: response.data.data, meta: response.data.meta };
}

export async function createTransaction(payload) {
  const response = await apiClient.post("/transactions", payload);
  return response.data.data;
}

export async function updateTransaction(id, payload) {
  const response = await apiClient.put(`/transactions/${id}`, payload);
  return response.data.data;
}

export async function voidTransaction(id) {
  await apiClient.delete(`/transactions/${id}`);
}

export async function restoreTransaction(id) {
  const response = await apiClient.post(`/transactions/${id}/restore`);
  return response.data.data;
}
