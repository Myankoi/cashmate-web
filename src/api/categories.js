import { apiClient, unwrap } from "./client.js";

export async function getCategories(status = "active", type = "") {
  return unwrap(
    await apiClient.get("/categories", {
      params: { status, type: type || undefined },
    }),
  );
}

export async function createCategory(payload) {
  return unwrap(await apiClient.post("/categories", payload));
}

export async function updateCategory(id, payload) {
  return unwrap(await apiClient.put(`/categories/${id}`, payload));
}

export async function disableCategory(id) {
  return unwrap(await apiClient.delete(`/categories/${id}`));
}

export async function restoreCategory(id) {
  return unwrap(await apiClient.post(`/categories/${id}/restore`));
}
