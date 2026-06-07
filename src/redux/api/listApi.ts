import { baseApi } from "./baseApi";
import { boardApi } from "./boardApi";

export const listApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createList: builder.mutation<
      { id: string; title: string; position: number; boardId: string },
      { title: string; position: number; boardId: string; tempId?: string }
    >({
      query: ({ title, position, boardId }) => ({
        url: "/lists",
        method: "POST",
        body: { title, position, boardId },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const tempId = arg.tempId ?? `temp-${Date.now()}`;
        const now = new Date().toISOString();
        const patch = dispatch(
          boardApi.util.updateQueryData(
            "getBoardById",
            arg.boardId,
            (draft) => {
              draft.lists.push({
                id: tempId,
                title: arg.title,
                position: arg.position,
                boardId: arg.boardId,
                createdAt: now,
                updatedAt: now,
                cards: [],
              });
              draft.lists.sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0)
              );
              draft.lists.forEach((l, i) => (l.position = i));
            }
          )
        );
        try {
          const { data } = await queryFulfilled;
          // Replace the temp list with the server-assigned one.
          dispatch(
            boardApi.util.updateQueryData(
              "getBoardById",
              arg.boardId,
              (draft) => {
                const idx = draft.lists.findIndex((l) => l.id === tempId);
                if (idx !== -1) {
                  draft.lists[idx] = {
                    ...draft.lists[idx],
                    ...data,
                  };
                }
              }
            )
          );
        } catch {
          patch.undo();
        }
      },
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
      async onQueryStarted(
        { listId, boardId, newPosition },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          boardApi.util.updateQueryData("getBoardById", boardId, (draft) => {
            const idx = draft.lists.findIndex((l) => l.id === listId);
            if (idx === -1) return;
            const [moved] = draft.lists.splice(idx, 1);
            draft.lists.splice(newPosition, 0, moved);
            draft.lists.forEach((l, i) => (l.position = i));
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
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
      async onQueryStarted(
        { listId, boardId, title },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          boardApi.util.updateQueryData("getBoardById", boardId, (draft) => {
            const list = draft.lists.find((l) => l.id === listId);
            if (list) list.title = title;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
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
      async onQueryStarted(
        { listId, boardId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          boardApi.util.updateQueryData("getBoardById", boardId, (draft) => {
            draft.lists = draft.lists.filter((l) => l.id !== listId);
            draft.lists.forEach((l, i) => (l.position = i));
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
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
