import { BoardState, Card, List } from "@/types";
import { createBoard, fetchBoards, fetchBoardDetails } from "@/lib/api/board";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createNewList,
  changeListTitle,
  changeListPosition,
} from "@/lib/api/list";
import {
  updateCard,
  createNewCard,
  changeCardPosition,
  toggleCardComplete,
} from "@/lib/api/card";
import { handleApiError } from "@/lib/utils";

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  loading: false,
  cardLoading: false,
  error: null,
};

const normalizePositions = (cards: Card[]): void => {
  cards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  cards.forEach((card, index) => {
    card.position = index;
  });
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

export const addNewList = createAsyncThunk(
  "board/addNewList",
  async (listData: { title: string; position: number; boardId: string }) => {
    return await createNewList(listData);
  }
);

export const addNewCard = createAsyncThunk(
  "board/addNewCard",
  async (cardData: Card) => {
    return await createNewCard(cardData);
  }
);

export const reviseCard = createAsyncThunk(
  "board/updateCard",
  async (cardData: Card) => {
    return await updateCard(cardData);
  }
);

export const toggleCard = createAsyncThunk(
  "board/toggleCardComplete",
  async (cardId: string) => {
    return await toggleCardComplete(cardId);
  }
);

export const updateListPosition = createAsyncThunk(
  "board/updateListPosition",
  async (listData: {
    boardId: string;
    newPosition: number;
    listId: string;
  }) => {
    return await changeListPosition(listData);
  }
);

export const updateListTitle = createAsyncThunk(
  "board/updateListName",
  async (listData: { listId: string; title: string }) => {
    return await changeListTitle(listData);
  }
);

export const updateCardPosition = createAsyncThunk(
  "board/updateCardPosition",
  async (cardData: { cardId: string; newPosition: number; listId: string }) => {
    return await changeCardPosition(cardData);
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
          cardToMove = lists[i].cards[cardIndex];
          break;
        }
      }

      if (!cardToMove) return;

      const currentListId = cardToMove.listId;
      const isSameList = currentListId === newListId;

      // 1. Remove card from current list
      if (currentListIndex !== -1 && currentCardIndex !== -1) {
        lists[currentListIndex].cards.splice(currentCardIndex, 1);

        // Update positions in the old list (if moving between lists)
        if (!isSameList) {
          lists[currentListIndex].cards.forEach((card, index) => {
            card.position = index;
          });
        }
      }

      // 2. Find the new list
      const newListIndex = lists.findIndex((list) => list.id === newListId);
      if (newListIndex === -1) return;

      // 3. Make space in the new list
      if (isSameList && newPosition < currentCardIndex) {
        // Moving up in the same list
        for (let i = newPosition; i < currentCardIndex; i++) {
          lists[newListIndex].cards[i].position += 1;
        }
      } else if (isSameList && newPosition > currentCardIndex) {
        // Moving down in the same list
        for (let i = currentCardIndex + 1; i <= newPosition; i++) {
          lists[newListIndex].cards[i].position -= 1;
        }
      } else if (!isSameList) {
        // Moving to a different list
        for (let i = newPosition; i < lists[newListIndex].cards.length; i++) {
          lists[newListIndex].cards[i].position += 1;
        }
      }

      // 4. Insert card at new position
      const updatedCard = {
        ...cardToMove,
        position: newPosition,
        listId: newListId,
      };

      lists[newListIndex].cards.splice(newPosition, 0, updatedCard);

      // 5. Normalize positions in the new list
      lists[newListIndex].cards.forEach((card, index) => {
        card.position = index;
      });

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
        console.log("Error fetching board details:", action.error);
        state.error = handleApiError(action.error);
      })
      .addCase(addNewList.fulfilled, (state, action: PayloadAction<List>) => {
        if (
          state.currentBoard &&
          action.payload.boardId === state.currentBoard.id
        ) {
          state.currentBoard.lists.push(action.payload);
          normalizePositions(
            state.currentBoard.lists.map(
              (l) => ({ ...l, position: l.position } as unknown as Card)
            )
          );
        }
      })
      .addCase(addNewCard.pending, (state) => {
        state.cardLoading = true;
      })
      .addCase(addNewCard.fulfilled, (state, action: PayloadAction<Card>) => {
        state.cardLoading = false;
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
      .addCase(addNewCard.rejected, (state, action) => {
        state.cardLoading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(reviseCard.pending, (state) => {
        state.cardLoading = true;
      })
      .addCase(reviseCard.fulfilled, (state, action: PayloadAction<Card>) => {
        state.cardLoading = false;
        if (!state.currentBoard) return;

        const {
          id: cardId,
          listId: newListId,
          position: newPosition,
        } = action.payload;
        let previousListId: string | undefined;
        let previousPosition: number | undefined;

        state.currentBoard.lists.forEach((list) => {
          const cardIndex = list.cards.findIndex((card) => card.id === cardId);
          if (cardIndex !== -1) {
            previousListId = list.id;
            previousPosition = list.cards[cardIndex].position;
            list.cards.splice(cardIndex, 1);
            normalizePositions(list.cards);
          }
        });

        const newListIndex = state.currentBoard.lists.findIndex(
          (list) => list.id === newListId
        );

        if (newListIndex === -1) return;

        const targetList = state.currentBoard.lists[newListIndex];

        if (typeof newPosition === "number") {
          targetList.cards.forEach((card) => {
            if ((card.position ?? 0) >= newPosition && card.id !== cardId) {
              card.position = (card.position ?? 0) + 1;
            }
          });
          targetList.cards.push({ ...action.payload, position: newPosition });
        } else {
          targetList.cards.push({
            ...action.payload,
            position: targetList.cards.length,
          });
        }

        normalizePositions(targetList.cards);
      })
      .addCase(reviseCard.rejected, (state, action) => {
        state.cardLoading = false;
        state.error = handleApiError(action.error);
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
