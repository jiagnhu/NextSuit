import { apiRequest } from "@/lib/api-client";

import type { LeadDetail, LeadListParams, LeadListResult, LeadStatus } from "./types";

export const leadsApi = {
  async list(params: LeadListParams): Promise<LeadListResult> {
    const response = await apiRequest<LeadListResult["items"]>("/leads", {
      query: {
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        q: params.q,
        source: params.source
      }
    });

    return {
      items: response.data,
      meta: {
        page: response.meta?.page ?? params.page,
        pageSize: response.meta?.pageSize ?? params.pageSize,
        total: response.meta?.total ?? response.data.length,
        totalPages: response.meta?.totalPages ?? 1
      }
    };
  },

  async detail(id: string) {
    const response = await apiRequest<LeadDetail>(`/leads/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: LeadStatus, notes?: string) {
    const response = await apiRequest<LeadDetail>(`/leads/${id}/status`, {
      method: "PATCH",
      body: {
        status,
        notes
      }
    });

    return response.data;
  }
};
