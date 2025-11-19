import { api } from "./client";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<{
      token: string;
      user: { id: string; email: string; created_at: string };
      is_new_user: boolean;
    }>("/auth", { email, password });
    return response.data;
  },

  signup: async (email: string, password: string) => {
    const response = await api.post<{
      token: string;
      user: { id: string; email: string; created_at: string };
      is_new_user: boolean;
    }>("/auth", { email, password });
    return response.data;
  },
};
