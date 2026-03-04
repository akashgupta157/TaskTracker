import prisma from "@/lib/prisma";
import { BoardMember } from "@/types";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  
  if (!body.boardId) {
    return NextResponse.json({ message: "Board ID is required" }, { status: 400 });
  }

  const board = await prisma.board.findUnique({
    where: { id: body.boardId },
  });

  if (!board) {
    return NextResponse.json({ message: "Board not found" }, { status: 404 });
  }

  const hasAccess = board.adminId === session.user.id ||
    await prisma.boardMember.findFirst({
      where: { boardId: board.id, userId: session.user.id },
    });

  if (!hasAccess) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

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

    return NextResponse.json(card);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as Session;
  
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  
  if (!body.id) {
    return NextResponse.json({ message: "Card ID is required" }, { status: 400 });
  }

  try {
    const existingCard = await prisma.card.findUnique({
      where: { id: body.id },
      include: { list: { include: { board: true } } },
    });

    if (!existingCard) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    const board = existingCard.list.board;
    const hasAccess = board.adminId === session.user.id ||
      await prisma.boardMember.findFirst({
        where: { boardId: board.id, userId: session.user.id },
      });

    if (!hasAccess) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id, assignees, ...updateData } = body;
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
    return NextResponse.json(card);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
