import { apiClient, unwrap } from "./client.js";

export async function getMonthlyReport(year) {
  return unwrap(await apiClient.get("/reports/monthly", { params: { year } }));
}
