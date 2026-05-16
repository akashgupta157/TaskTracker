import { baseApi } from "./baseApi";
import type { Activity } from "@/types";

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCardActivity: builder.query<Activity[], string>({
      query: (cardId) => ({ url: `/cards/${cardId}/activity`, method: "GET" }),
      providesTags: (_, __, cardId) => [{ type: "Activity", id: cardId }],
    }),
  }),
});

export const { useGetCardActivityQuery } = activityApi;
