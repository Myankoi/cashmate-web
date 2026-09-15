import { apiClient, unwrap } from "./client.js";

export async function getDashboardSummary() {
  return unwrap(await apiClient.get("/dashboard/summary"));
}
