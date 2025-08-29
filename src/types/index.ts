type User = {
  id: string;
  name: string;
  email: string;
  image: string;
};

export interface AppError {
  message: string;
  statusCode?: number;
  code?: string;
  timestamp?: string;
}

export type BoardState = {
  boards: Board[];
  currentBoard: (Board & { lists: (List & { cards: Card[] })[] }) | null;
  loading: boolean;
  cardLoading: boolean;
  error: AppError | null;
};

export type Board = {
  id: string;
  title: string;
  description?: string;
  adminId: string;
  admin: User;
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
  priority?: Priority | null;
  isCompleted: boolean;
  listId: string;
  dueDate?: string | null;
  checklist?: ChecklistItem[] | null;
  createdAt?: string;
  updatedAt?: string;
  attachments?: Attachment[] | null;
};

export type Attachment = {
  name: string;
  url: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  isChecked: boolean;
};

export type BoardMember = {
  id: string;
  boardId: string;
  userId: string;
  user: User;
  role: Role;
  createdAt: string;
};

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum Role {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}
