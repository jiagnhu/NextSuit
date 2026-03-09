import { apiRequest } from "@/lib/api-client";

import type { LoginPayload, LoginResult, MeProfile } from "./types";

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await apiRequest<LoginResult>("/auth/login", {
      method: "POST",
      body: payload
    });

    return response.data;
  },

  async me() {
    const response = await apiRequest<MeProfile>("/auth/me", {
      method: "GET"
    });

    return response.data;
  },

  async logout() {
    const response = await apiRequest<{ loggedOut: boolean }>("/auth/logout", {
      method: "POST"
    });

    return response.data;
  }
};
