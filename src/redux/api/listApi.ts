import { baseApi } from "./baseApi";

export const listApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createList: builder.mutation<
      { id: string; title: string; position: number; boardId: string },
      { title: string; position: number; boardId: string }
    >({
      query: (body) => ({
        url: "/lists",
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),

    updateListPosition: builder.mutation<
      { id: string; position: number },
      { listId: string; boardId: string; newPosition: number }
    >({
      query: ({ listId, boardId, newPosition }) => ({
        url: `/lists/${listId}`,
        method: "PATCH",
        body: { boardId, newPosition },
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),

    updateListTitle: builder.mutation<
      { id: string; title: string },
      { listId: string; boardId: string; title: string }
    >({
      query: ({ listId, title }) => ({
        url: `/lists/${listId}`,
        method: "PATCH",
        body: { title },
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),

    deleteList: builder.mutation<
      { deletedListId: string },
      { listId: string; boardId: string }
    >({
      query: ({ listId }) => ({
        url: `/lists/${listId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),
  }),
});

export const {
  useCreateListMutation,
  useUpdateListPositionMutation,
  useUpdateListTitleMutation,
  useDeleteListMutation,
} = listApi;
