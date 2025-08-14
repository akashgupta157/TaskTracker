import axios from "axios";
import { Card } from "@/types";

export const createNewCard = async (cardData: Card) => {
  try {
    const { data } = await axios.post("/api/cards", cardData);
    return data;
  } catch (error) {
    return error;
  }
};
export const updateCard = async (cardData: Card) => {
  try {
    const { data } = await axios.patch("/api/cards", cardData);
    return data;
  } catch (error) {
    return error;
  }
};

export const toggleCardComplete = async (cardId: string) => {
  try {
    const { data } = await axios.patch(`/api/cards/${cardId}`, {
      toggleComplete: true,
    });
    return data;
  } catch (error) {
    return error;
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
    return error;
  }
};
