import { UniqueIdentifier } from "@dnd-kit/core";

type User = {
  id: string;
  name: string;
  email: string;
  image: string;
};
export type BoardState = {
  boards: Board[];
  currentBoard: (Board & { lists: (List & { cards: Card[] })[] }) | null;
  loading: boolean;
  cardLoading: boolean;
};

export type Board = {
  id: string;
  title: string;
  description?: string;
  admin: string;
  user: User;
  background: string;
  createdAt: string;
  updatedAt: string;
  lists: List[];
  members: BoardMember[];
};

export type List = {
  id: string;
  title: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  cards: Card[];
};

export type Card = {
  id?: string;
  title: string;
  description?: string | null;
  position: number;
  priority?: string | null;
  isCompleted: boolean;
  assignedTo?: string | null;
  listId: string;
  dueDate?: string | null;
  checklist?: ChecklistItem[];
  createdAt?: string;
  updatedAt?: string;
  attachments?: Attachment[];
  boardMembers?: BoardMember[];
};

export type ChecklistItem = {
  title: string;
  isChecked: boolean;
};

export type Attachment = {
  id: string;
  url: string;
  type: string;
  name: string;
  cardId: string;
  createdAt: string;
};

export type BoardMember = {
  id: string;
  boardId: string;
  userId: string;
  role: string;
  cardId?: string;
  createdAt: string;
};
