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
  boards: Board[];
  currentBoard: (Board & { lists: (List & { cards: Card[] })[] }) | null;
  loading: boolean;
  error: AppError | null;
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
  position: number ;
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
