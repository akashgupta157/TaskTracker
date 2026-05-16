import { BoardState, Card, List } from "@/types";
import { normalizePositions } from "@/lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

    addCard: (state, action: PayloadAction<Card>) => {
      if (!state.currentBoard) return;

      const targetList = state.currentBoard.lists.find(
        (list) => list.id === action.payload.listId
      );

      if (!targetList) return;

      targetList.cards.push({ ...action.payload });
      normalizePositions(targetList.cards);
    },

    modifyCard: (state, action: PayloadAction<Card>) => {
      if (!state.currentBoard) return;

      const updatedCard = { ...action.payload };

      // Remove from old list
      for (const list of state.currentBoard.lists) {
        const index = list.cards.findIndex(
          (card) => card.id === updatedCard.id
        );

        if (index !== -1) {
          list.cards.splice(index, 1);
          normalizePositions(list.cards);
          break;
        }
      }

      // Add to new list
      const targetList = state.currentBoard.lists.find(
        (list) => list.id === updatedCard.listId
      );

      if (!targetList) return;

      targetList.cards.splice(updatedCard.position, 0, updatedCard);

      normalizePositions(targetList.cards);
    },

    removeCard: (state, action: PayloadAction<{ cardId: string }>) => {
      if (!state.currentBoard) return;

      for (const list of state.currentBoard.lists) {
        const index = list.cards.findIndex(
          (card) => card.id === action.payload.cardId
        );

        if (index !== -1) {
          list.cards.splice(index, 1);
          normalizePositions(list.cards);
          break;
        }
      }
    },

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

    toggleCardIsComplete: (
      state,
      action: PayloadAction<{ cardId: string }>
    ) => {
      if (!state.currentBoard) return;
      state.currentBoard.lists.forEach((list) => {
        const card = list.cards.find((c) => c.id === action.payload.cardId);
        if (card) {
          card.isCompleted = !card.isCompleted;
        }
      });
    },

    addList: (state, action: PayloadAction<List>) => {
      if (!state.currentBoard) return;

      state.currentBoard.lists.push({
        ...action.payload,
        cards: action.payload.cards ?? [],
      });

      normalizePositions(state.currentBoard.lists);
    },

    deleteList: (state, action: PayloadAction<{ listId: string }>) => {
      if (!state.currentBoard) return;

      state.currentBoard.lists = state.currentBoard.lists.filter(
        (list) => list.id !== action.payload.listId
      );

      normalizePositions(state.currentBoard.lists);
    },

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

    modifyListTitle: (
      state,
      action: PayloadAction<{ listId: string; title: string }>
    ) => {
      if (!state.currentBoard) return;

      const list = state.currentBoard.lists.find(
        (l) => l.id === action.payload.listId
      );
      if (list) {
        list.title = action.payload.title;
      }
    },
  },
});

export default boardSlice.reducer;

export const {
  setCurrentBoard,
  toggleCardIsComplete,
  moveList,
  moveCard,
  modifyListTitle,
  addList,
  deleteList,
  addCard,
  modifyCard,
  removeCard,
} = boardSlice.actions;
