import { combineReducers, configureStore } from "@reduxjs/toolkit";
import boardReducer from "./slices/boardSlice";
import listReducer from "./slices/listSlice";
import cardReducer from "./slices/cardSlice";

const rootReducer = combineReducers({
  board: boardReducer,
  list: listReducer,
  card: cardReducer,
});
export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
