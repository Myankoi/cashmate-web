import { apiClient, unwrap } from "./client.js";

export async function registerOwner(payload) {
  return unwrap(
    await apiClient.post("/auth/register", payload, { skipAuthRefresh: true }),
  );
}

export async function loginOwner(payload) {
  return unwrap(
    await apiClient.post("/auth/login", payload, { skipAuthRefresh: true }),
  );
}

export async function getCurrentUser() {
  return unwrap(await apiClient.get("/auth/me"));
}

export async function logoutCurrentUser() {
  return unwrap(await apiClient.post("/auth/logout"));
}

export async function updateProfilePhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  return unwrap(await apiClient.put("/auth/me/photo", formData));
}
