import { apiRequest } from "@/lib/api-client";

import type { ContactListParams, ContactListResult, ContactStatus } from "./types";

export const contactsApi = {
  async list(params: ContactListParams): Promise<ContactListResult> {
    const response = await apiRequest<ContactListResult["items"]>("/contacts", {
      query: {
        page: params.page,
        pageSize: params.pageSize,
        q: params.q,
        status: params.status
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

  async updateStatus(id: string, status: ContactStatus) {
    const response = await apiRequest<{ id: string; status: ContactStatus }>(`/contacts/${id}/status`, {
      method: "PATCH",
      body: { status }
    });

    return response.data;
  }
};
