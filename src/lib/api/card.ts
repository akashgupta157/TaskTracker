import axios from "axios";
import { Card } from "@/types";
import { handleApiError, throwSpecificError } from "../utils";

export const createNewCard = async (cardData: Card) => {
  try {
    const { data } = await axios.post("/api/cards", cardData);
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};
export const updateCard = async (cardData: Card) => {
  try {
    const { data } = await axios.patch("/api/cards", cardData);
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};

export const toggleCardComplete = async (cardId: string) => {
  try {
    const { data } = await axios.patch(`/api/cards/${cardId}`, {
      toggleComplete: true,
    });
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};

export const changeCardPosition = async (cardData: {
  cardId: string;
  newPosition: number;
  listId: string;
}) => {
  try {
    const { data } = await axios.patch(`/api/cards/${cardData.cardId}`, {
      position: cardData.newPosition,
      listId: cardData.listId,
    });
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};

export const removeCard = async (cardId: string) => {
  try {
    const { data } = await axios.delete(`/api/cards/${cardId}`);
    return data;
  } catch (error) {
    throwSpecificError(handleApiError(error));
  }
};
