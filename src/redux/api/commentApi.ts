import { baseApi } from "./baseApi";
import type { Comment } from "@/types";

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCardComments: builder.query<Comment[], string>({
      query: (cardId) => ({ url: `/cards/${cardId}/comments`, method: "GET" }),
      providesTags: (_, __, cardId) => [{ type: "Comments", id: cardId }],
    }),

    addComment: builder.mutation<
      Comment,
      { cardId: string; content: string }
    >({
      query: ({ cardId, content }) => ({
        url: `/cards/${cardId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (_, __, { cardId }) => [
        { type: "Comments", id: cardId },
        { type: "Activity", id: cardId },
      ],
    }),

    updateComment: builder.mutation<
      Comment,
      { cardId: string; commentId: string; content: string }
    >({
      query: ({ cardId, commentId, content }) => ({
        url: `/cards/${cardId}/comments/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: (_, __, { cardId }) => [
        { type: "Comments", id: cardId },
      ],
    }),

    deleteComment: builder.mutation<
      { deletedCommentId: string },
      { cardId: string; commentId: string }
    >({
      query: ({ cardId, commentId }) => ({
        url: `/cards/${cardId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, { cardId }) => [
        { type: "Comments", id: cardId },
        { type: "Activity", id: cardId },
      ],
    }),
  }),
});

export const {
  useGetCardCommentsQuery,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
