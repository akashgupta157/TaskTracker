export interface CardFilters {
  isCompleted?: boolean;
  priority?: ("LOW" | "MEDIUM" | "HIGH")[];
  assigneeId?: string[];
  dueDate?: "today" | "overdue" | "upcoming";
  search?: string | null;
}

export interface CardWhereInput {
  isCompleted?: boolean;
  priority?: { in: ("LOW" | "MEDIUM" | "HIGH")[] };
  assignees?: {
    some: {
      boardMember: {
        userId: { in: string[] };
      };
    };
  };
  dueDate?: {
    gte?: Date;
    lte?: Date;
    lt?: Date;
  };
  OR?: Array<{
    title?: {
      contains: string;
      mode: "insensitive";
    };
    description?: {
      contains: string;
      mode: "insensitive";
    };
  }>;
}

export function buildCardWhereClause(filters: CardFilters): CardWhereInput {
  const whereClause: CardWhereInput = {};

  if (filters.isCompleted !== undefined) {
    whereClause.isCompleted = filters.isCompleted;
  }

  if (filters.priority && filters.priority.length > 0) {
    whereClause.priority = { in: filters.priority };
  }

  if (filters.assigneeId && filters.assigneeId.length > 0) {
    whereClause.assignees = {
      some: {
        boardMember: {
          userId: { in: filters.assigneeId },
        },
      },
    };
  }

  if (filters.dueDate) {
    const now = new Date();
    switch (filters.dueDate) {
      case "today":
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.dueDate = {
          gte: startOfDay,
          lte: endOfDay,
        };
        break;
      case "overdue":
        whereClause.dueDate = {
          lt: now,
        };
        whereClause.isCompleted = false;
        break;
      case "upcoming":
        whereClause.dueDate = {
          gte: now,
        };
        break;
    }
  }

  if (filters.search) {
    whereClause.OR = [
      {
        title: {
          contains: filters.search,
          mode: "insensitive" as const,
        },
      },
      {
        description: {
          contains: filters.search,
          mode: "insensitive" as const,
        },
      },
    ];
  }

  return whereClause;
}
