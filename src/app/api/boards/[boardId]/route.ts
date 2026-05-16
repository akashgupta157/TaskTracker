import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { authOptions } from "@/utils/authOption";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;
  const { boardId } = await params;

  try {
    const { background } = await request.json();

    const existingBoard = await prisma.board.findUnique({
      where: { id: boardId },
      select: { adminId: true },
    });

    if (!existingBoard) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    if (existingBoard.adminId !== session.user.id) {
      return NextResponse.json(
        { message: "Only the board admin can update the background" },
        { status: 403 }
      );
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { background },
      include: {
        admin: true,
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
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

    return NextResponse.json(updatedBoard);
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;

  try {
    const { boardId } = await params;

    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
        OR: [
          { adminId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        admin: true,
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
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
