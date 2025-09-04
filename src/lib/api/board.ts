import axios from "axios";
import { CardFilters } from "@/types/CardFilter";
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

export const fetchFilterBoards = async (
  boardId: string,
  filter: CardFilters
) => {
  try {
    const params = new URLSearchParams();

    if (filter.isCompleted !== undefined) {
      params.append("isCompleted", filter.isCompleted.toString());
    }

    // Handle multiple priorities
    if (filter.priority && filter.priority.length > 0) {
      filter.priority.forEach((priority: string) => {
        params.append("priority", priority);
      });
    }

    // Handle multiple assignees
    if (filter.assigneeId && filter.assigneeId.length > 0) {
      filter.assigneeId.forEach((assigneeId: string) => {
        params.append("assigneeId", assigneeId);
      });
    }

    if (filter.dueDate) {
      params.append("dueDate", filter.dueDate);
    }

    if (filter.search) {
      params.append("search", filter.search);
    }

    const { data } = await axios.get(
      `/api/boards/${boardId}/filter?${params.toString()}`
    );
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};
