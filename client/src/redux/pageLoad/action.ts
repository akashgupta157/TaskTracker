export const setPageLoad = (isPageLoaded: any) => {
  return {
    type: "SET_PAGE_LOAD",
    payload: isPageLoaded,
  };
};
