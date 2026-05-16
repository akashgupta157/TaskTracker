type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface AppError {
  message: string;
  statusCode?: number;
  code?: string;
  timestamp?: string;
}

export type BoardState = {
  currentBoard: (Board & { lists: (List & { cards: Card[] })[] }) | null;
};

export type Board = {
  id: string;
  title: string;
  description?: string | null;
  background?: string | null;
  adminId: string;
  admin: User;
  createdAt: string;
  updatedAt: string;
  lists: List[];
  members: BoardMember[];
  invitations: Invitation[];
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
  id: string;
  title: string;
  description?: string | null;
  position: number;
  priority?: Priority | null;
  isCompleted: boolean;
  listId: string;
  dueDate?: string | null;
  checklist?: ChecklistItem[] | null;
  attachments?: Attachment[] | null;
  createdAt: string;
  updatedAt: string;
  assignees?: never[] | CardAssignment[] | null;
  boardId: string;
};

export type CardAssignment = {
  id: string;
  cardId: string;
  boardMemberId: string;
  boardMember: BoardMember;
  assignedAt: string;
  assignedById: string;
  assignedBy: User;
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
  assignedCards: CardAssignment[];
};

export type Invitation = {
  id: string;
  email: string;
  boardId: string;
  board: Board;
  token: string;
  createdAt: string;
  expiresAt: string;
  status: InvitationStatus;
  inviterId: string;
  inviter: User;
};

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export type Comment = {
  id: string;
  content: string;
  cardId: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
};

export type ActivityType =
  | "CARD_CREATED"
  | "CARD_DELETED"
  | "CARD_MOVED"
  | "CARD_COMPLETED"
  | "CARD_REOPENED"
  | "TITLE_CHANGED"
  | "DESCRIPTION_CHANGED"
  | "PRIORITY_CHANGED"
  | "DUE_DATE_SET"
  | "DUE_DATE_CHANGED"
  | "DUE_DATE_REMOVED"
  | "ASSIGNEE_ADDED"
  | "ASSIGNEE_REMOVED"
  | "CHECKLIST_ADDED"
  | "CHECKLIST_ITEM_CHECKED"
  | "CHECKLIST_ITEM_UNCHECKED"
  | "CHECKLIST_ITEM_REMOVED"
  | "ATTACHMENT_ADDED"
  | "ATTACHMENT_REMOVED"
  | "COMMENT_ADDED"
  | "COMMENT_DELETED";

export type Activity = {
  id: string;
  type: ActivityType;
  cardId: string | null;
  boardId: string;
  userId: string;
  user: User;
  data: Record<string, unknown> | null;
  createdAt: string;
};

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
