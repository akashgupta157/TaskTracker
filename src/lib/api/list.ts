import axios from "axios";

export const createNewList = async (listData: {
  title: string;
  position: number;
  boardId: string;
}) => {
  try {
    const { data } = await axios.post("/api/lists", listData);
    return data;
  } catch (error) {
    return error;
  }
};

export const changeListPosition = async (listData: {
  boardId: string;
  newPosition: number;
  listId: string;
}) => {
  try {
    const { data } = await axios.patch(`/api/lists/${listData.listId}`, {
      boardId: listData.boardId,
      newPosition: listData.newPosition,
    });
    return data;
  } catch (error) {
    return error;
  }
};

export const changeListTitle = async (listData: {
  listId: string;
  title: string;
}) => {
  try {
    const { data } = await axios.patch(`/api/lists/${listData.listId}`, {
      title: listData.title,
    });
    return data;
  } catch (error) {
    return error;
  }
};
