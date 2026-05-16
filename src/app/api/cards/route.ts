import prisma from "@/lib/prisma";
import { BoardMember } from "@/types";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { diffCardActivities, logActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  const body = await request.json();
  try {
    const { assignees = [], ...cardData } = body;
    const card = await prisma.card.create({
      data: {
        ...cardData,
        assignees: {
          create: assignees.map((boardMember: BoardMember) => ({
            boardMemberId: boardMember.id,
            assignedById: session.user.id,
          })),
        },
      },
      include: {
        assignees: {
          include: {
            boardMember: {
              include: { user: true },
            },
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
        assignees.map((m: BoardMember) => ({
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  const body = await request.json();
  try {
    const { id, assignees, ...updateData } = body;

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

    const card = await prisma.card.update({
      where: { id },
      data: {
        ...updateData,
        ...(assignees && {
          assignees: {
            deleteMany: {},
            create: assignees.map((boardMember: BoardMember) => ({
              boardMemberId: boardMember.id,
              assignedById: session.user.id,
            })),
          },
        }),
      },
      include: {
        assignees: {
          include: {
            boardMember: {
              include: { user: true },
            },
          },
        },
      },
    });

    const listTitles: Record<string, string> = {};
    for (const l of before.board.lists) listTitles[l.id] = l.title;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const beforeAssigneeUserIds = before.assignees.map(
      (a: any) => a.boardMember.userId
    );
    const afterAssigneeUserIds = assignees
      ? assignees.map((m: BoardMember) => m.userId)
      : beforeAssigneeUserIds;

    const events = diffCardActivities({
      before: {
        title: before.title,
        description: before.description,
        priority: before.priority,
        dueDate: before.dueDate,
        listId: before.listId,
        isCompleted: before.isCompleted,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        checklist: (before.checklist as any) || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: (before.attachments as any) || null,
        assigneeUserIds: beforeAssigneeUserIds,
      },
      after: {
        title: updateData.title ?? before.title,
        description: updateData.description ?? before.description,
        priority: updateData.priority ?? before.priority,
        dueDate: updateData.dueDate ?? before.dueDate,
        listId: updateData.listId ?? before.listId,
        isCompleted: updateData.isCompleted ?? before.isCompleted,
        checklist: updateData.checklist ?? before.checklist,
        attachments: updateData.attachments ?? before.attachments,
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
