import { apiRequest } from "@/lib/api-client";

import type { SubscriberListParams, SubscriberListResult, SubscriberStatus } from "./types";

export const subscribersApi = {
  async list(params: SubscriberListParams): Promise<SubscriberListResult> {
    const response = await apiRequest<SubscriberListResult["items"]>("/subscribers", {
      query: {
        page: params.page,
        pageSize: params.pageSize,
        q: params.q
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

  async updateStatus(id: string, status: SubscriberStatus) {
    const response = await apiRequest<{ id: string; status: SubscriberStatus }>(
      `/subscribers/${id}/status`,
      {
        method: "PATCH",
        body: { status }
      }
    );

    return response.data;
  }
};
