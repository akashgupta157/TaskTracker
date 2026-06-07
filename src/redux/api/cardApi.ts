import { baseApi } from "./baseApi";
import { boardApi } from "./boardApi";
import type { Card } from "@/types";

export const cardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCard: builder.mutation<Card, Card>({
      query: (body) => ({
        url: "/cards",
        method: "POST",
        body,
      }),
      // Optimistically insert the new card into the board cache.
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        if (!arg.boardId) return;
        const patch = dispatch(
          boardApi.util.updateQueryData(
            "getBoardById",
            arg.boardId,
            (draft) => {
              const list = draft.lists.find((l) => l.id === arg.listId);
              if (!list) return;
              list.cards.push({ ...arg });
              list.cards.sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0)
              );
              list.cards.forEach((c, i) => (c.position = i));
            }
          )
        );
        try {
          const { data } = await queryFulfilled;
          // Reconcile server-assigned id and any computed fields.
          dispatch(
            boardApi.util.updateQueryData(
              "getBoardById",
              arg.boardId,
              (draft) => {
                const list = draft.lists.find((l) => l.id === data.listId);
                if (!list) return;
                const idx = list.cards.findIndex((c) => c.id === arg.id);
                if (idx !== -1) list.cards[idx] = { ...list.cards[idx], ...data };
                else list.cards.push(data);
              }
            )
          );
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_, __, arg) => [{ type: "Board", id: arg.boardId }],
    }),

    updateCard: builder.mutation<Card, Card>({
      query: (body) => ({
        url: "/cards",
        method: "PATCH",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        if (!arg.boardId) return;
        const patch = dispatch(
          boardApi.util.updateQueryData(
            "getBoardById",
            arg.boardId,
            (draft) => {
              // Remove from any current list
              for (const list of draft.lists) {
                const idx = list.cards.findIndex((c) => c.id === arg.id);
                if (idx !== -1) {
                  list.cards.splice(idx, 1);
                  list.cards.forEach((c, i) => (c.position = i));
                  break;
                }
              }
              // Insert into target list at the desired position
              const target = draft.lists.find((l) => l.id === arg.listId);
              if (!target) return;
              const pos = Math.min(arg.position ?? 0, target.cards.length);
              target.cards.splice(pos, 0, { ...arg });
              target.cards.forEach((c, i) => (c.position = i));
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_, __, arg) => [
        { type: "Board", id: arg.boardId },
        { type: "Activity", id: arg.id },
      ],
    }),

    toggleCardComplete: builder.mutation<
      Card,
      { cardId: string; boardId: string | undefined }
    >({
      query: ({ cardId }) => ({
        url: `/cards/${cardId}`,
        method: "PATCH",
        body: { toggleComplete: true },
      }),
      async onQueryStarted({ cardId, boardId }, { dispatch, queryFulfilled }) {
        if (!boardId) return;
        const patch = dispatch(
          boardApi.util.updateQueryData("getBoardById", boardId, (draft) => {
            for (const list of draft.lists) {
              const card = list.cards.find((c) => c.id === cardId);
              if (card) {
                card.isCompleted = !card.isCompleted;
                break;
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_, __, arg) => [
        { type: "Board", id: arg.boardId },
        { type: "Activity", id: arg.cardId },
      ],
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
      async onQueryStarted(
        { cardId, listId, newPosition, boardId },
        { dispatch, queryFulfilled }
      ) {
        if (!boardId) return;
        const patch = dispatch(
          boardApi.util.updateQueryData("getBoardById", boardId, (draft) => {
            let moving: typeof draft.lists[number]["cards"][number] | null =
              null;
            for (const list of draft.lists) {
              const idx = list.cards.findIndex((c) => c.id === cardId);
              if (idx !== -1) {
                moving = list.cards.splice(idx, 1)[0];
                list.cards.forEach((c, i) => (c.position = i));
                break;
              }
            }
            if (!moving) return;
            const target = draft.lists.find((l) => l.id === listId);
            if (!target) return;
            moving.listId = listId;
            target.cards.splice(
              Math.min(newPosition, target.cards.length),
              0,
              moving
            );
            target.cards.forEach((c, i) => (c.position = i));
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

    deleteCard: builder.mutation<
      { deletedCardId: string },
      { cardId: string; boardId: string | undefined }
    >({
      query: ({ cardId }) => ({
        url: `/cards/${cardId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ cardId, boardId }, { dispatch, queryFulfilled }) {
        if (!boardId) return;
        const patch = dispatch(
          boardApi.util.updateQueryData("getBoardById", boardId, (draft) => {
            for (const list of draft.lists) {
              const idx = list.cards.findIndex((c) => c.id === cardId);
              if (idx !== -1) {
                list.cards.splice(idx, 1);
                list.cards.forEach((c, i) => (c.position = i));
                break;
              }
            }
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
  useCreateCardMutation,
  useUpdateCardMutation,
  useToggleCardCompleteMutation,
  useUpdateCardPositionMutation,
  useDeleteCardMutation,
} = cardApi;
