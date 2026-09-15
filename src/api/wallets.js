import { apiClient, unwrap } from "./client.js";

export async function getWallets(status = "active") {
  return unwrap(await apiClient.get("/wallets", { params: { status } }));
}

export async function createWallet(payload) {
  return unwrap(await apiClient.post("/wallets", payload));
}

export async function updateWallet(id, payload) {
  return unwrap(await apiClient.put(`/wallets/${id}`, payload));
}

export async function disableWallet(id) {
  return unwrap(await apiClient.delete(`/wallets/${id}`));
}

export async function restoreWallet(id) {
  return unwrap(await apiClient.post(`/wallets/${id}/restore`));
}
