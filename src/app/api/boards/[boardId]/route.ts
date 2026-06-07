import { z } from "zod";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import {
  requireSession,
  assertBoardMembership,
  handleAuthError,
} from "@/lib/auth";

const updateBoardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  background: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const session = await requireSession();
    const { boardId } = await params;
    // Board update requires admin
    await assertBoardMembership(session.user.id, boardId, {
      requireAdmin: true,
    });

    const parsed = updateBoardSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: parsed.data,
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
                    boardMember: { include: { user: true } },
                  },
                },
              },
            },
          },
        },
        members: { include: { user: true } },
      },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const session = await requireSession();
    const { boardId } = await params;
    await assertBoardMembership(session.user.id, boardId, {
      requireAdmin: true,
    });

    await prisma.board.delete({ where: { id: boardId } });
    return NextResponse.json({ deletedBoardId: boardId });
  } catch (error) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const session = await requireSession();
    const { boardId } = await params;

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
              orderBy: { position: "asc" },
              include: {
                assignees: {
                  include: {
                    boardMember: { include: { user: true } },
                  },
                },
              },
            },
          },
        },
        members: { include: { user: true } },
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
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
