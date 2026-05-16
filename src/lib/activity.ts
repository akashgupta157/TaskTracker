import prisma from "@/lib/prisma";

export type ActivityTypeKey =
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

type LogInput = {
  type: ActivityTypeKey;
  boardId: string;
  userId: string;
  cardId?: string | null;
  data?: Record<string, unknown>;
};

export async function logActivity(entries: LogInput | LogInput[]) {
  const list = Array.isArray(entries) ? entries : [entries];
  if (list.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).activity.createMany({
    data: list.map((e) => ({
      type: e.type,
      boardId: e.boardId,
      userId: e.userId,
      cardId: e.cardId ?? null,
      data: e.data ?? undefined,
    })),
  });
}

type CardSnapshot = {
  title: string;
  description: string | null;
  priority: string | null;
  dueDate: Date | string | null;
  listId: string;
  isCompleted: boolean;
  checklist: { id: string; title: string; isChecked: boolean }[] | null;
  attachments: { name: string; url: string }[] | null;
  assigneeUserIds: string[];
};

export function diffCardActivities({
  before,
  after,
  cardId,
  boardId,
  userId,
  listTitles,
}: {
  before: CardSnapshot;
  after: CardSnapshot;
  cardId: string;
  boardId: string;
  userId: string;
  listTitles: Record<string, string>;
}): LogInput[] {
  const events: LogInput[] = [];

  if (before.title !== after.title) {
    events.push({
      type: "TITLE_CHANGED",
      boardId,
      userId,
      cardId,
      data: { from: before.title, to: after.title },
    });
  }

  const beforeDesc = (before.description || "").trim();
  const afterDesc = (after.description || "").trim();
  if (beforeDesc !== afterDesc) {
    events.push({
      type: "DESCRIPTION_CHANGED",
      boardId,
      userId,
      cardId,
    });
  }

  if (before.priority !== after.priority) {
    events.push({
      type: "PRIORITY_CHANGED",
      boardId,
      userId,
      cardId,
      data: { from: before.priority, to: after.priority },
    });
  }

  const beforeDue = before.dueDate
    ? new Date(before.dueDate).toISOString()
    : null;
  const afterDue = after.dueDate ? new Date(after.dueDate).toISOString() : null;
  if (beforeDue !== afterDue) {
    if (!beforeDue && afterDue) {
      events.push({
        type: "DUE_DATE_SET",
        boardId,
        userId,
        cardId,
        data: { to: afterDue },
      });
    } else if (beforeDue && !afterDue) {
      events.push({
        type: "DUE_DATE_REMOVED",
        boardId,
        userId,
        cardId,
        data: { from: beforeDue },
      });
    } else {
      events.push({
        type: "DUE_DATE_CHANGED",
        boardId,
        userId,
        cardId,
        data: { from: beforeDue, to: afterDue },
      });
    }
  }

  if (before.listId !== after.listId) {
    events.push({
      type: "CARD_MOVED",
      boardId,
      userId,
      cardId,
      data: {
        fromListId: before.listId,
        toListId: after.listId,
        fromListTitle: listTitles[before.listId] ?? null,
        toListTitle: listTitles[after.listId] ?? null,
      },
    });
  }

  if (before.isCompleted !== after.isCompleted) {
    events.push({
      type: after.isCompleted ? "CARD_COMPLETED" : "CARD_REOPENED",
      boardId,
      userId,
      cardId,
    });
  }

  // Assignees diff
  const beforeAssignees = new Set(before.assigneeUserIds);
  const afterAssignees = new Set(after.assigneeUserIds);
  for (const uid of afterAssignees) {
    if (!beforeAssignees.has(uid)) {
      events.push({
        type: "ASSIGNEE_ADDED",
        boardId,
        userId,
        cardId,
        data: { assigneeUserId: uid },
      });
    }
  }
  for (const uid of beforeAssignees) {
    if (!afterAssignees.has(uid)) {
      events.push({
        type: "ASSIGNEE_REMOVED",
        boardId,
        userId,
        cardId,
        data: { assigneeUserId: uid },
      });
    }
  }

  // Checklist diff (track item-level changes)
  const beforeList = before.checklist || [];
  const afterList = after.checklist || [];
  const beforeMap = new Map(beforeList.map((i) => [i.id, i]));
  const afterMap = new Map(afterList.map((i) => [i.id, i]));

  for (const item of afterList) {
    const prev = beforeMap.get(item.id);
    if (!prev) {
      if (item.title.trim()) {
        events.push({
          type: "CHECKLIST_ADDED",
          boardId,
          userId,
          cardId,
          data: { title: item.title },
        });
      }
    } else if (prev.isChecked !== item.isChecked) {
      events.push({
        type: item.isChecked
          ? "CHECKLIST_ITEM_CHECKED"
          : "CHECKLIST_ITEM_UNCHECKED",
        boardId,
        userId,
        cardId,
        data: { title: item.title },
      });
    }
  }
  for (const item of beforeList) {
    if (!afterMap.has(item.id)) {
      events.push({
        type: "CHECKLIST_ITEM_REMOVED",
        boardId,
        userId,
        cardId,
        data: { title: item.title },
      });
    }
  }

  // Attachments diff
  const beforeAtt = before.attachments || [];
  const afterAtt = after.attachments || [];
  const beforeUrls = new Set(beforeAtt.map((a) => a.url));
  const afterUrls = new Set(afterAtt.map((a) => a.url));
  for (const a of afterAtt) {
    if (!beforeUrls.has(a.url)) {
      events.push({
        type: "ATTACHMENT_ADDED",
        boardId,
        userId,
        cardId,
        data: { name: a.name, url: a.url },
      });
    }
  }
  for (const a of beforeAtt) {
    if (!afterUrls.has(a.url)) {
      events.push({
        type: "ATTACHMENT_REMOVED",
        boardId,
        userId,
        cardId,
        data: { name: a.name },
      });
    }
  }

  return events;
}
