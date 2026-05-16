import { baseApi } from "./baseApi";
import type { Card } from "@/types";

export const cardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCard: builder.mutation<Card, Card>({
      query: (body) => ({
        url: "/cards",
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),

    updateCard: builder.mutation<Card, Card>({
      query: (body) => ({
        url: "/cards",
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),

    toggleCardComplete: builder.mutation<Card, string>({
      query: (cardId) => ({
        url: `/cards/${cardId}`,
        method: "PATCH",
        body: { toggleComplete: true },
      }),
      invalidatesTags: ["Board"],
    }),

    updateCardPosition: builder.mutation<
      Card,
      {
        cardId: string;
        newPosition: number;
        listId: string;
        boardId: string | undefined;
      }
    >({
      query: ({ cardId, newPosition, listId }) => ({
        url: `/cards/${cardId}`,
        method: "PATCH",
        body: { position: newPosition, listId },
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),

    deleteCard: builder.mutation<
      { deletedCardId: string },
      { cardId: string; boardId: string | undefined }
    >({
      query: ({ cardId }) => ({
        url: `/cards/${cardId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),
  }),
});

export const {
  useCreateCardMutation,
  useUpdateCardMutation,
  useToggleCardCompleteMutation,
  useUpdateCardPositionMutation,
  useDeleteCardMutation,
} = cardApi;
