const initialState = false;
export const pageLoadReducer = (
  state = initialState,
  action: { type: any; payload: any }
) => {
  switch (action.type) {
    case "SET_PAGE_LOAD":
      return action.payload;
    default:
      return state;
  }
};
