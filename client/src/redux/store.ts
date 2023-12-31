import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { authReducer } from "../redux/auth/reducer";
import { pageLoadReducer } from "../redux/pageLoad/reducer";
import thunk from "redux-thunk";
const rootReducer = combineReducers({
  authReducer,
  pageLoadReducer,
});
export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));
