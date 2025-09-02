import { BoardState, List, Card } from "@/types";
import { addNewList, deleteList } from "./listSlice";
import { handleApiError, normalizePositions } from "@/lib/utils";
import { addNewCard, reviseCard, deleteCard } from "./cardSlice";
import { createBoard, fetchBoards, fetchBoardDetails } from "@/lib/api/board";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

export const getBoards = createAsyncThunk("board/getBoards", async () => {
  return await fetchBoards();
});

export const addNewBoard = createAsyncThunk(
  "board/addNewBoard",
  async (boardData: { title: string; description: string }) => {
    return await createBoard(boardData);
  }
);

export const getBoardDetails = createAsyncThunk(
  "board/fetchBoardDetails",
  async (boardId: string) => {
    return await fetchBoardDetails(boardId);
  }
);

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
    toggleCardIsComplete: (
      state,
      action: PayloadAction<{ cardId: string }>
    ) => {
      if (!state.currentBoard) return;

      state.currentBoard.lists.forEach((list) => {
        const cardIndex = list.cards.findIndex(
          (card) => card.id === action.payload.cardId
        );
        if (cardIndex !== -1) {
          list.cards[cardIndex].isCompleted =
            !list.cards[cardIndex].isCompleted;
        }
      });
    },
    moveList: (
      state,
      action: PayloadAction<{
        listId: string;
        newPosition: number;
      }>
    ) => {
      if (!state.currentBoard) return;

      const { listId, newPosition } = action.payload;
      const lists = [...state.currentBoard.lists];

      const currentIndex = lists.findIndex((list) => list.id === listId);
      if (currentIndex === -1) return;

      const [movedList] = lists.splice(currentIndex, 1);
      lists.splice(newPosition, 0, movedList);

      state.currentBoard.lists = lists.map((list, index) => ({
        ...list,
        position: index,
      }));
    },
    moveCard: (
      state,
      action: PayloadAction<{
        newPosition: number;
        cardId: string;
        listId: string;
      }>
    ) => {
      if (!state.currentBoard) return;

      const { cardId, listId: newListId, newPosition } = action.payload;
      const lists = [...state.currentBoard.lists];

      // Find the card and its current list
      let cardToMove: Card | undefined;
      let currentListIndex = -1;
      let currentCardIndex = -1;

      for (let i = 0; i < lists.length; i++) {
        const cardIndex = lists[i].cards.findIndex(
          (card) => card.id === cardId
        );
        if (cardIndex !== -1) {
          currentListIndex = i;
          currentCardIndex = cardIndex;
          cardToMove = { ...lists[i].cards[cardIndex] };
          break;
        }
      }

      if (!cardToMove) return;

      const currentListId = cardToMove.listId;
      const isSameList = currentListId === newListId;

      // Remove card from current list
      if (currentListIndex !== -1 && currentCardIndex !== -1) {
        lists[currentListIndex].cards.splice(currentCardIndex, 1);
        normalizePositions(lists[currentListIndex].cards);
      }

      // Find the new list
      const newListIndex = lists.findIndex((list) => list.id === newListId);
      if (newListIndex === -1) return;

      // Make sure cards array exists
      if (!lists[newListIndex].cards) {
        lists[newListIndex].cards = [];
      }

      // Adjust positions in the target list
      if (isSameList) {
        if (newPosition < currentCardIndex) {
          for (let i = newPosition; i < currentCardIndex; i++) {
            if (lists[newListIndex].cards[i]) {
              lists[newListIndex].cards[i].position += 1;
            }
          }
        } else if (newPosition > currentCardIndex) {
          for (let i = currentCardIndex + 1; i <= newPosition; i++) {
            if (lists[newListIndex].cards[i]) {
              lists[newListIndex].cards[i].position -= 1;
            }
          }
        }
      } else {
        for (let i = newPosition; i < lists[newListIndex].cards.length; i++) {
          if (lists[newListIndex].cards[i]) {
            lists[newListIndex].cards[i].position += 1;
          }
        }
      }

      // Insert card at new position
      const updatedCard = {
        ...cardToMove,
        position: newPosition,
        listId: newListId,
      };

      const safePosition = Math.min(
        newPosition,
        lists[newListIndex].cards.length
      );
      lists[newListIndex].cards.splice(safePosition, 0, updatedCard);

      // Normalize positions in the new list
      normalizePositions(lists[newListIndex].cards);

      state.currentBoard.lists = lists;
    },
    modifyListTitle: (
      state,
      action: PayloadAction<{ listId: string; title: string }>
    ) => {
      if (!state.currentBoard) return;

      const { listId, title } = action.payload;
      const list = state.currentBoard.lists.find((list) => list.id === listId);
      if (list) {
        list.title = title;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getBoards.fulfilled,
        (state, action: PayloadAction<BoardState["boards"]>) => {
          state.loading = false;
          state.boards = action.payload;
        }
      )
      .addCase(getBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(
        addNewBoard.fulfilled,
        (
          state,
          action: PayloadAction<NonNullable<BoardState["currentBoard"]>>
        ) => {
          state.boards.push(action.payload);
          state.currentBoard = action.payload;
        }
      )
      .addCase(addNewBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(getBoardDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getBoardDetails.fulfilled,
        (
          state,
          action: PayloadAction<NonNullable<BoardState["currentBoard"]>>
        ) => {
          state.loading = false;

          if (action.payload.lists) {
            action.payload.lists.forEach((list) => {
              normalizePositions(list.cards);
            });
          }

          state.currentBoard = action.payload;
        }
      )
      .addCase(getBoardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(addNewList.fulfilled, (state, action: PayloadAction<List>) => {
        if (
          state.currentBoard &&
          action.payload.boardId === state.currentBoard.id
        ) {
          state.currentBoard.lists.push({ ...action.payload, cards: [] });
          normalizePositions(state.currentBoard.lists);
        }
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        const deletedListId = action.payload;
        if (state.currentBoard) {
          state.currentBoard.lists = state.currentBoard.lists.filter(
            (list) => list.id !== deletedListId
          );
          normalizePositions(state.currentBoard.lists);
        }
      })
      .addCase(addNewCard.fulfilled, (state, action: PayloadAction<Card>) => {
        if (state.currentBoard) {
          const listIndex = state.currentBoard.lists.findIndex(
            (list) => list.id === action.payload.listId
          );
          if (listIndex !== -1) {
            state.currentBoard.lists[listIndex].cards.push(action.payload);
            normalizePositions(state.currentBoard.lists[listIndex].cards);
          }
        }
      })
      .addCase(reviseCard.fulfilled, (state, action: PayloadAction<Card>) => {
        if (!state.currentBoard) return;

        const {
          id: cardId,
          listId: newListId,
          position: newPosition,
        } = action.payload;

        // Remove card from current list
        state.currentBoard.lists.forEach((list) => {
          const cardIndex = list.cards.findIndex((card) => card.id === cardId);
          if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1);
            normalizePositions(list.cards);
          }
        });

        // Add card to new list
        const newListIndex = state.currentBoard.lists.findIndex(
          (list) => list.id === newListId
        );
        if (newListIndex === -1) return;

        const targetList = state.currentBoard.lists[newListIndex];
        targetList.cards.push(action.payload);
        normalizePositions(targetList.cards);
      })
      .addCase(deleteCard.fulfilled, (state, action: PayloadAction<string>) => {
        if (!state.currentBoard) return;

        const deletedCardId = action.payload;
        state.currentBoard.lists.forEach((list) => {
          const cardIndex = list.cards.findIndex(
            (card) => card.id === deletedCardId
          );
          if (cardIndex !== -1) {
            list.cards.splice(cardIndex, 1);
            normalizePositions(list.cards);
          }
        });
      });
  },
});

export default boardSlice.reducer;
export const {
  setCurrentBoard,
  toggleCardIsComplete,
  moveList,
  moveCard,
  modifyListTitle,
  clearError,
} = boardSlice.actions;
