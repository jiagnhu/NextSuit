import { apiRequest } from "@/lib/api-client";

import type { ContentPerformance, DashboardOverview, RecentLead } from "./types";

export const dashboardApi = {
  async getOverview() {
    const response = await apiRequest<DashboardOverview>("/dashboard/overview");
    return response.data;
  },

  async getRecentLeads(limit = 8) {
    const response = await apiRequest<RecentLead[]>("/dashboard/recent-leads", {
      query: { limit }
    });

    return response.data;
  },

  async getContentPerformance(days = 14) {
    const response = await apiRequest<ContentPerformance>("/dashboard/content-performance", {
      query: { days }
    });

    return response.data;
  }
};
