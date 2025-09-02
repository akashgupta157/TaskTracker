import { AppError, Card } from "@/types";
import { handleApiError } from "@/lib/utils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  updateCard,
  createNewCard,
  changeCardPosition,
  toggleCardComplete,
  removeCard,
} from "@/lib/api/card";

interface CardState {
  cardLoading: boolean;
  error: AppError | null;
}

const initialState: CardState = {
  cardLoading: false,
  error: null,
};

export const addNewCard = createAsyncThunk(
  "card/addNewCard",
  async (cardData: Card) => {
    return await createNewCard(cardData);
  }
);

export const reviseCard = createAsyncThunk(
  "card/updateCard",
  async (cardData: Card) => {
    return await updateCard(cardData);
  }
);

export const toggleCard = createAsyncThunk(
  "card/toggleCardComplete",
  async (cardId: string) => {
    return await toggleCardComplete(cardId);
  }
);

export const updateCardPosition = createAsyncThunk(
  "card/updateCardPosition",
  async (cardData: { cardId: string; newPosition: number; listId: string }) => {
    return await changeCardPosition(cardData);
  }
);

export const deleteCard = createAsyncThunk(
  "card/deleteCard",
  async (cardId: string) => {
    const response = await removeCard(cardId);
    return response.deletedCardId || cardId;
  }
);

const cardSlice = createSlice({
  name: "card",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewCard.pending, (state) => {
        state.cardLoading = true;
      })
      .addCase(addNewCard.fulfilled, (state) => {
        state.cardLoading = false;
      })
      .addCase(addNewCard.rejected, (state, action) => {
        state.cardLoading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(reviseCard.pending, (state) => {
        state.cardLoading = true;
      })
      .addCase(reviseCard.fulfilled, (state) => {
        state.cardLoading = false;
      })
      .addCase(reviseCard.rejected, (state, action) => {
        state.cardLoading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(toggleCard.pending, (state) => {
        state.cardLoading = true;
      })
      .addCase(toggleCard.fulfilled, (state) => {
        state.cardLoading = false;
      })
      .addCase(toggleCard.rejected, (state, action) => {
        state.cardLoading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(updateCardPosition.pending, (state) => {
        state.cardLoading = true;
      })
      .addCase(updateCardPosition.fulfilled, (state) => {
        state.cardLoading = false;
      })
      .addCase(updateCardPosition.rejected, (state, action) => {
        state.cardLoading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(deleteCard.pending, (state) => {
        state.cardLoading = true;
      })
      .addCase(deleteCard.fulfilled, (state) => {
        state.cardLoading = false;
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.cardLoading = false;
        state.error = handleApiError(action.error);
      });
  },
});

export default cardSlice.reducer;
