import { AppError } from "@/types";
import { handleApiError } from "@/lib/utils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  removeList,
  createNewList,
  changeListTitle,
  changeListPosition,
} from "@/lib/api/list";

interface ListState {
  loading: boolean;
  error: AppError | null;
}

const initialState: ListState = {
  loading: false,
  error: null,
};

export const addNewList = createAsyncThunk(
  "list/addNewList",
  async (listData: { title: string; position: number; boardId: string }) => {
    return await createNewList(listData);
  }
);

export const updateListPosition = createAsyncThunk(
  "list/updateListPosition",
  async (listData: {
    boardId: string;
    newPosition: number;
    listId: string;
  }) => {
    return await changeListPosition(listData);
  }
);

export const updateListTitle = createAsyncThunk(
  "list/updateListName",
  async (listData: { listId: string; title: string }) => {
    return await changeListTitle(listData);
  }
);

export const deleteList = createAsyncThunk(
  "list/removeList",
  async (listId: string) => {
    const response = await removeList(listId);
    return response.deletedListId || listId;
  }
);

const listSlice = createSlice({
  name: "list",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewList.pending, (state) => {
        state.loading = true;
      })
      .addCase(addNewList.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addNewList.rejected, (state, action) => {
        state.loading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(updateListPosition.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateListPosition.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateListPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(updateListTitle.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateListTitle.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateListTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = handleApiError(action.error);
      })
      .addCase(deleteList.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteList.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.loading = false;
        state.error = handleApiError(action.error);
      });
  },
});

export default listSlice.reducer;
