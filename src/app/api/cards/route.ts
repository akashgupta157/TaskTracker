import { z } from "zod";
import prisma from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { diffCardActivities, logActivity } from "@/lib/activity";
import {
  requireSession,
  assertBoardMembership,
  handleAuthError,
} from "@/lib/auth";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

const assigneeSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  // allow other fields but only id/userId are used
}).passthrough();

const checklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  isChecked: z.boolean(),
});

const attachmentSchema = z.object({
  name: z.string(),
  url: z.string(),
});

const createCardSchema = z.object({
  title: z.string().min(1).max(200),
  listId: z.string().min(1),
  boardId: z.string().min(1),
  position: z.number().int().min(0),
  description: z.string().max(20000).nullable().optional(),
  priority: priorityEnum.nullable().optional(),
  dueDate: z.string().nullable().optional(),
  isCompleted: z.boolean().optional(),
  checklist: z.array(checklistItemSchema).nullable().optional(),
  attachments: z.array(attachmentSchema).nullable().optional(),
  assignees: z.array(assigneeSchema).optional(),
});

const patchCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  listId: z.string().min(1).optional(),
  position: z.number().int().min(0).optional(),
  description: z.string().max(20000).nullable().optional(),
  priority: priorityEnum.nullable().optional(),
  dueDate: z.string().nullable().optional(),
  isCompleted: z.boolean().optional(),
  checklist: z.array(checklistItemSchema).nullable().optional(),
  attachments: z.array(attachmentSchema).nullable().optional(),
  assignees: z.array(assigneeSchema).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = createCardSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { assignees = [], description, ...rest } = parsed.data;
    await assertBoardMembership(session.user.id, rest.boardId);

    const card = await prisma.card.create({
      data: {
        title: rest.title,
        listId: rest.listId,
        boardId: rest.boardId,
        position: rest.position,
        priority: rest.priority ?? null,
        dueDate: rest.dueDate ? new Date(rest.dueDate) : null,
        isCompleted: rest.isCompleted ?? false,
        description: sanitizeHtml(description ?? null),
        checklist: rest.checklist ?? undefined,
        attachments: rest.attachments ?? undefined,
        assignees: {
          create: assignees.map((m) => ({
            boardMemberId: m.id,
            assignedById: session.user.id,
          })),
        },
      },
      include: {
        assignees: {
          include: {
            boardMember: { include: { user: true } },
          },
        },
      },
    });

    await logActivity({
      type: "CARD_CREATED",
      boardId: card.boardId,
      userId: session.user.id,
      cardId: card.id,
      data: { title: card.title, listId: card.listId },
    });

    if (assignees.length > 0) {
      await logActivity(
        assignees.map((m) => ({
          type: "ASSIGNEE_ADDED" as const,
          boardId: card.boardId,
          userId: session.user.id,
          cardId: card.id,
          data: { assigneeUserId: m.userId },
        }))
      );
    }

    return NextResponse.json(card);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const parsed = patchCardSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { id, assignees, description, dueDate, ...updateData } = parsed.data;

    const before = await prisma.card.findUnique({
      where: { id },
      include: {
        assignees: { include: { boardMember: true } },
        board: { include: { lists: { select: { id: true, title: true } } } },
      },
    });
    if (!before) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }
    await assertBoardMembership(session.user.id, before.boardId);

    const data: Record<string, unknown> = { ...updateData };
    if (description !== undefined) data.description = sanitizeHtml(description);
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const card = await prisma.card.update({
      where: { id },
      data: {
        ...data,
        ...(assignees && {
          assignees: {
            deleteMany: {},
            create: assignees.map((m) => ({
              boardMemberId: m.id,
              assignedById: session.user.id,
            })),
          },
        }),
      },
      include: {
        assignees: {
          include: {
            boardMember: { include: { user: true } },
          },
        },
      },
    });

    const listTitles: Record<string, string> = {};
    for (const l of before.board.lists) listTitles[l.id] = l.title;

    const beforeAssigneeUserIds = before.assignees.map(
      (a) => a.boardMember.userId
    );
    const afterAssigneeUserIds = assignees
      ? assignees.map((m) => m.userId)
      : beforeAssigneeUserIds;

    const events = diffCardActivities({
      before: {
        title: before.title,
        description: before.description,
        priority: before.priority,
        dueDate: before.dueDate,
        listId: before.listId,
        isCompleted: before.isCompleted,
        checklist:
          (before.checklist as { id: string; title: string; isChecked: boolean }[] | null) ||
          null,
        attachments:
          (before.attachments as { name: string; url: string }[] | null) || null,
        assigneeUserIds: beforeAssigneeUserIds,
      },
      after: {
        title: updateData.title ?? before.title,
        description:
          description !== undefined
            ? sanitizeHtml(description)
            : before.description,
        priority:
          updateData.priority !== undefined
            ? updateData.priority
            : before.priority,
        dueDate:
          dueDate !== undefined
            ? dueDate
              ? new Date(dueDate)
              : null
            : before.dueDate,
        listId: updateData.listId ?? before.listId,
        isCompleted: updateData.isCompleted ?? before.isCompleted,
        checklist:
          (updateData.checklist as
            | { id: string; title: string; isChecked: boolean }[]
            | null
            | undefined) ??
          (before.checklist as { id: string; title: string; isChecked: boolean }[] | null),
        attachments:
          (updateData.attachments as { name: string; url: string }[] | null | undefined) ??
          (before.attachments as { name: string; url: string }[] | null),
        assigneeUserIds: afterAssigneeUserIds,
      },
      cardId: card.id,
      boardId: card.boardId,
      userId: session.user.id,
      listTitles,
    });

    if (events.length) await logActivity(events);

    return NextResponse.json(card);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
