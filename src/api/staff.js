import { apiClient, unwrap } from "./client.js";

export async function getStaff(status = "active") {
  return unwrap(await apiClient.get("/staff", { params: { status } }));
}

export async function createStaff(payload) {
  return unwrap(await apiClient.post("/staff", payload));
}

export async function disableStaff(id) {
  return unwrap(await apiClient.delete(`/staff/${id}`));
}

export async function restoreStaff(id) {
  return unwrap(await apiClient.post(`/staff/${id}/restore`));
}
