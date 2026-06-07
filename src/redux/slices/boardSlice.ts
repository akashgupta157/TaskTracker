import { BoardState, Card } from "@/types";
import { normalizePositions } from "@/lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * boardSlice holds a transient snapshot of the active board used for UI-only
 * concerns such as live drag-preview during drag-over events.
 *
 * The authoritative data lives in the RTK Query `getBoardById` cache. The
 * page-level component mirrors that result into `currentBoard` so existing
 * consumer components (Header, Filter, CardDialog, BackgroundSelector) can
 * keep reading from a single selector. Server mutations are handled via
 * RTK Query `onQueryStarted` optimistic patches against the query cache.
 *
 * Only reducers that represent ephemeral drag-preview UI state remain here.
 */
const initialState: BoardState = {
  currentBoard: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setCurrentBoard: (
      state,
      action: PayloadAction<BoardState["currentBoard"]>
    ) => {
      state.currentBoard = action.payload;
    },

    // Drag-preview only: reorders cards in the in-memory snapshot during
    // dnd-kit's onDragOver. The server-side write happens in onDragEnd.
    moveCard: (
      state,
      action: PayloadAction<{
        cardId: string;
        listId: string;
        newPosition: number;
      }>
    ) => {
      if (!state.currentBoard) return;

      const { cardId, listId, newPosition } = action.payload;
      const lists = [...state.currentBoard.lists];

      let cardToMove: Card | null = null;

      for (const list of lists) {
        const index = list.cards.findIndex((c) => c.id === cardId);
        if (index !== -1) {
          cardToMove = { ...list.cards[index] };
          list.cards.splice(index, 1);
          normalizePositions(list.cards);
          break;
        }
      }

      if (!cardToMove) return;

      const targetList = lists.find((l) => l.id === listId);
      if (!targetList) return;

      cardToMove.listId = listId;
      cardToMove.position = newPosition;

      targetList.cards.splice(
        Math.min(newPosition, targetList.cards.length),
        0,
        cardToMove
      );

      normalizePositions(targetList.cards);
      state.currentBoard.lists = lists;
    },

    // Drag-preview only: reorders lists in the in-memory snapshot.
    moveList: (
      state,
      action: PayloadAction<{ listId: string; newPosition: number }>
    ) => {
      if (!state.currentBoard) return;

      const lists = [...state.currentBoard.lists];
      const index = lists.findIndex(
        (list) => list.id === action.payload.listId
      );

      if (index === -1) return;

      const [moved] = lists.splice(index, 1);
      lists.splice(action.payload.newPosition, 0, moved);

      state.currentBoard.lists = lists.map((list, i) => ({
        ...list,
        position: i,
      }));
    },
  },
});

export default boardSlice.reducer;

export const { setCurrentBoard, moveCard, moveList } = boardSlice.actions;
