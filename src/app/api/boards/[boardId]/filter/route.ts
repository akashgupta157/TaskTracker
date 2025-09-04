import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { CardFilters, buildCardWhereClause } from "@/types/CardFilter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  const { searchParams } = new URL(request.url);

  try {
    const { boardId } = await params;

    const filters: CardFilters = {};

    if (searchParams.has("isCompleted")) {
      filters.isCompleted = searchParams.get("isCompleted") === "true";
    }

    if (searchParams.has("priority")) {
      const priorities = searchParams.getAll("priority");
      const validPriorities = priorities.filter(
        (p): p is "LOW" | "MEDIUM" | "HIGH" =>
          ["LOW", "MEDIUM", "HIGH"].includes(p)
      );
      if (validPriorities.length > 0) {
        filters.priority = validPriorities;
      }
    }

    if (searchParams.has("assigneeId")) {
      const assignees = searchParams.getAll("assigneeId");
      if (assignees.length > 0) {
        filters.assigneeId = assignees;
      }
    }

    if (searchParams.has("dueDate")) {
      const dueDate = searchParams.get("dueDate");
      if (dueDate && ["today", "overdue", "upcoming"].includes(dueDate)) {
        filters.dueDate = dueDate as "today" | "overdue" | "upcoming";
      }
    }

    if (searchParams.has("search")) {
      filters.search = searchParams.get("search");
    }

    const cardWhereClause = buildCardWhereClause(filters);

    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
        OR: [
          { adminId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        admin: true,
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              where: cardWhereClause,
              orderBy: { position: "asc" },
              include: {
                assignees: {
                  include: {
                    boardMember: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json(
        { message: "Unauthorized or board not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(board);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
