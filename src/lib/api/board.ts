import axios from "axios";
import { handleApiError, throwSpecificError } from "../utils";

export const fetchBoards = async () => {
  try {
    const { data } = await axios.get("/api/boards");
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};

export const createBoard = async (boardData: {
  title: string;
  description: string;
}) => {
  try {
    const { data } = await axios.post("/api/boards", boardData);
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};

export const fetchBoardDetails = async (boardId: string) => {
  try {
    const { data } = await axios.get(`/api/boards/${boardId}`);
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};
